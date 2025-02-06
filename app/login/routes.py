from __future__ import annotations
from app.login import bp
from app.models import *
from app.login.loginforms import RegisterForm, LoginForm
from datetime import datetime
from flask import request, jsonify, render_template, redirect, url_for, flash, current_app
from flask_login import login_required
from flask_login import current_user, login_user, logout_user
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
import os
from werkzeug.utils import secure_filename
import uuid
import jwt
import requests
from jwt.algorithms import RSAAlgorithm
import redis
import time

TENANT_ID = os.getenv("TENANT_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"

def get_signing_keys():
    response = requests.get(JWKS_URL)
    keys = response.json()['keys']
    # Debugging - Print out all keys for inspection
    # print("Available Keys:", keys)
    return {key['kid']: RSAAlgorithm.from_jwk(key) for key in keys}

SIGNING_KEYS = get_signing_keys()

def validate_jwt(token):
    global SIGNING_KEYS
    try:
        SIGNING_KEYS = get_signing_keys()  # Refresh keys
        headers = jwt.get_unverified_header(token)
        kid = headers.get('kid')
        print(f"JWT Kid: {kid}")

        if kid not in SIGNING_KEYS:
            print("KID not found in signing keys. Refreshing keys...")
            SIGNING_KEYS = get_signing_keys()

        decoded_token = jwt.decode(
            token,
            key=SIGNING_KEYS.get(kid, None),
            algorithms=['RS256'],
            audience=CLIENT_ID,
            issuer=f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
        )
        return decoded_token
    except jwt.ExpiredSignatureError:
        print("JWT expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Error validating JWT: {e}")
        return None

def decode_jwt_header(token):
    try:
        # Get the unverified header to check which key was used to sign the JWT
        header = jwt.get_unverified_header(token)
        print("JWT Header:", header)
        return header
    except Exception as e:
        print(f"Error decoding JWT header: {e}")
        return None

#File storage:
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def add_dietary_restrictions(restriction_ids, user_id):
    # theoretically this will prevent duplicate data
    UserDietaryRestriction.query.filter_by(user_id=user_id).delete()

    for restriction_id in restriction_ids:
        new_restriction = UserDietaryRestriction(user_id=user_id, restriction_id=restriction_id)
        db.session.add(new_restriction)

    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error adding dietary restrictions for user {user_id}: {e}")


# route for registering through API
@bp.route('/api/register/', methods=['POST'])
def api_register():
    username = request.form.get('username')
    email = request.form.get('email')
    fname = request.form.get('fname')
    lname = request.form.get('lname')
    colonial_floor = request.form.get('colonial_floor')
    colonial_side = request.form.get('colonial_side')
    profile_picture = request.files.get('profile_picture')
    dietary_restrictions = request.form.get('dietaryRestrictions')

    user = User.query.filter_by(email_address=email).first()
    if user is not None:
        return jsonify({"message": "There is already an account with that email address"}), 400

    userNameValidation = User.query.filter_by(username=username).first()
    if userNameValidation is not None:
        return jsonify({"message": "There is already an account with that username"}), 400

    if colonial_floor == "":
        colonial_floor = None
    if colonial_side == "":
        colonial_side = None

    new_user = User(
        fname=fname,
        lname=lname,
        username=username,
        email_address=email,  
        colonial_floor=colonial_floor,
        colonial_side=colonial_side,
        xp_points=0,
        is_admin=False,
        num_recipes_completed=0,
        date_created=datetime.utcnow(),
        num_reports=0,
        user_level=1,
        last_logged_in=datetime.utcnow()
    )
    db.session.add(new_user)
    db.session.commit()  # Commit so `new_user.id` is generated

    if profile_picture and allowed_file(profile_picture.filename):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)

        filename = f"{uuid.uuid4().hex}_{secure_filename(profile_picture.filename)}"
        file_path = os.path.join(upload_folder, filename)
        profile_picture.save(file_path)

        relative_path = os.path.join('static', 'uploads', filename)
        new_user.profile_picture = relative_path
        profile_picture_url = relative_path
        db.session.commit()
    else:
        profile_picture_url = None

    if dietary_restrictions:
        restriction_mapping = {
            "Wheat": 1, "Dairy": 2, "Egg": 3, "Fish": 4, "Pork": 5,
            "Shellfish": 6, "Soy": 7, "Treenut": 8, "Peanut": 9, "Sesame": 10,
            "Vegan": 11, "Vegetarian": 12
        }
        dietary_restriction_list = dietary_restrictions.split(',')
        restriction_ids = [restriction_mapping[restriction] for restriction in dietary_restriction_list if restriction in restriction_mapping]

        add_dietary_restrictions(restriction_ids, new_user.id)
    
    user = User.query.filter_by(email_address=email).first()

    print(user)

    if user:
        login_user(user, remember=True)
        return jsonify({
        "message": "Registration successful",
        "profile_picture_url": profile_picture_url
    }), 200
    else:
        print("User not registered")
        return jsonify({"message": "User not registered"}), 200

 


@bp.route('/api/validate_user/', methods=['POST']) 
def validate_user():
    username = request.json.get('username')
    email = request.json.get('email')

    print(username)
    print(email)

    if username and User.query.filter_by(username=username).first():
        print("invalid 1")
        return jsonify({"valid": False, "message": "Username already in use"}), 400

    if email and User.query.filter_by(email_address=email).first():
        return jsonify({"valid": False, "message": "Email already in use"}), 400
        print("invalid 2")

    return jsonify({"valid": True, "message": "Valid"}), 200



@bp.route('/api/login/sso/', methods=['POST'])
def sso_login():
    data = request.json
    token = data.get("token")

    print("LOGIN TOKEN: ", token)
    decoded = jwt.decode(token, options={"verify_signature": False})
    print("DECODED TOKEN: ", decoded)
    exp = decoded.get("exp", 0)
    print(f"Token expires at: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(exp))}")


    if not token:
        return jsonify({"message": "No token provided"}), 400

    decoded_token = validate_jwt(token)
    if not decoded_token:
        return jsonify({"message": "Invalid token"}), 401

    email = decoded_token.get("preferred_username")  #email
    name = decoded_token.get("name")
    if name:
        name = name.split()
        fname = name[1].replace(",", "")
        lname = name[0]
    else:
        return jsonify({"message": "Invalid token: No name found"}), 401


    if not email:
        return jsonify({"message": "Invalid token: No email found"}), 401

    user = User.query.filter_by(email_address=email).first()

    print(user)

    if user:
        login_user(user, remember=True)
        return jsonify({"message": "Login successful", "user_id": user.id}), 200
    else:
        print("User not registered")
        return jsonify({"message": "User not registered"}), 200

@bp.route('/api/get_initial_data/', methods=['POST'])
def get_initial_data():
    data = request.json
    token = data.get("token")

    if not token:
        return jsonify({"message": "No token provided"}), 400

    decoded_token = validate_jwt(token)
    if not decoded_token:
        return jsonify({"message": "Invalid token"}), 401

    email = decoded_token.get("preferred_username")  #email
    name = decoded_token.get("name")
    if name:
        name = name.split()
        fname = name[1]
        lname = name[0]
    else:
        return jsonify({"message": "Invalid token: No name found"}), 401

    if not email:
        return jsonify({"message": "Invalid token: No email found"}), 401
    
    return jsonify({
        "email": email,
        "fname": fname,
        "lname": lname
    }), 200


@bp.route('/api/logout/', methods=['POST'])
def logout():
    # Get the token from the Authorization header
    token = request.headers.get('Authorization')
    
    # Ensure the token is present in the request
    if not token:
        return jsonify({"message": "Token is missing from request"}), 400

    # Remove "Bearer " prefix if it exists
    token = token.replace("Bearer ", "")

    # Decode the JWT to check its contents without verifying signature for debugging
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        print("Decoded token: ", decoded)
        exp = decoded.get("exp", 0)
        print(f"Token expires at: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(exp))}")
    except jwt.DecodeError as e:
        print(f"Error decoding JWT: {e}")
        return jsonify({"message": "Invalid token"}), 401

    # Now check if the token is an access token or an ID token
    if 'id_token' in decoded:
        # If it's an ID token, you need to handle it differently (probably store it in session or invalidate it based on its session)
        print("ID Token detected - Handle logout with ID token")
        # If you're using the ID token for login, you need to invalidate the session based on that
        # Here you would typically invalidate the user session
        logout_user()
        return jsonify({"message": "Successfully logged out with ID token"}), 200
    
    # Otherwise, it's an access token and you can proceed with the revocation
    decoded_token = validate_jwt(token)
    if not decoded_token:
        return jsonify({"message": "Invalid access token"}), 401

    # Extract the JWT ID (jti) to keep track of the token and revoke it
    jti = decoded_token.get("jti")
    if jti:
        # Store the JWT ID in Redis with a 24-hour expiration time to mark it as revoked
        revoked_tokens.set(jti, "revoked", ex=3600 * 24)  
        print(f"Access token {jti} marked as revoked.")

    # Log out the current user (invalidate the session)
    logout_user()
    return jsonify({"message": "Successfully logged out"}), 200