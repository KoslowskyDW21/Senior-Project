from __future__ import annotations
from sqlite3 import IntegrityError
from app.login import bp
from app.models import *
from better_profanity import profanity
from datetime import datetime, UTC
import html
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

profanity.load_censor_words()

def get_signing_keys():
    response = requests.get(JWKS_URL)
    keys = response.json()['keys']
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

        key = SIGNING_KEYS.get(kid, None)

        decoded_token = jwt.decode(
            token,
            key=key,
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
        new_restriction = UserDietaryRestriction(user_id=user_id, restriction_id=restriction_id) #type: ignore
        db.session.add(new_restriction)

    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error adding dietary restrictions for user {user_id}: {e}")

def add_cuisines(cuisine_ids, user_id):
    # theoretically this will prevent duplicate data
    UserCuisinePreference.query.filter_by(user_id=user_id).delete()

    for cuisine_id in cuisine_ids:
        new_cuisine = UserCuisinePreference(user_id=user_id, cuisine_id=cuisine_id, numComplete = 0, userSelected = 1) #type: ignore
        db.session.add(new_cuisine)

    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error adding cuisines for user {user_id}: {e}")


def escape_html(input_text):
    return html.escape(input_text)

# route for registering through API
@bp.route('/register/', methods=['POST'])
def api_register():
    username = request.form.get('username')
    email = request.form.get('email')
    fname = request.form.get('fname')
    lname = request.form.get('lname')
    colonial_floor = request.form.get('colonial_floor')
    colonial_side = request.form.get('colonial_side')
    profile_picture = request.files.get('profile_picture')
    dietary_restrictions = request.form.get('dietaryRestrictions')
    cuisines = request.form.get('cuisines')

    if not lname:
        return jsonify({"message": "Last name is required"}), 400
    lname = lname.replace(",", "")

    user = User.query.filter_by(email_address=email).first()
    if user is not None:
        return jsonify({"message": "There is already an account with that email address"}), 400

    userNameValidation = User.query.filter_by(username=username).first()
    if userNameValidation is not None:
        return jsonify({"message": "There is already an account with that username"}), 400

    
    username = escape_html(username)

    if colonial_floor == "":
        colonial_floor = None
    if colonial_side == "":
        colonial_side = None

    new_user = User(
        fname=fname, #type: ignore
        lname=lname, #type: ignore
        username=username, #type: ignore
        email_address=email, #type: ignore
        colonial_floor=colonial_floor, #type: ignore
        colonial_side=colonial_side, #type: ignore
        xp_points=0, #type: ignore
        is_admin=False, #type: ignore
        num_recipes_completed=0, #type: ignore
        date_created=datetime.now(UTC), #type: ignore
        num_reports=0, #type: ignore
        user_level=1, #type: ignore
        last_logged_in=datetime.now(UTC) #type: ignore
    )
    db.session.add(new_user)
    db.session.commit()  # Commit so `new_user.id` is generated

    if profile_picture and allowed_file(profile_picture.filename):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        filename = profile_picture.filename
        if not filename:
            return jsonify({"message": "No file part"}), 400
        filename = f"{uuid.uuid4().hex}_{secure_filename(filename)}"
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

    if cuisines:
        cuisine_mapping = {
            "British": 1, "Malaysian": 2, "Indian": 3, "American": 4, "Mexican": 5, "Russian": 6, "French": 7, "Canadian": 8, "Jamaican": 9, "Chinese": 10, 
            "Italian": 11, "Dutch": 12, "Vietnamese": 13, "Polish": 14, "Irish": 15, "Croatian": 16, "Filipino": 17, "Ukrainian": 18, "Unknown": 19, "Japanese": 20, 
            "Moroccan": 21, "Tunisian": 22, "Turkish": 23, "Greek": 24, "Egyptian": 25, "Portuguese": 26, "Kenyan": 27, "Thai": 28, "Spanish": 29
        }
        cuisine_list = cuisines.split(',')
        cuisine_ids = [cuisine_mapping[cuisine] for cuisine in cuisine_list if cuisine in cuisine_mapping]

        add_cuisines(cuisine_ids, new_user.id)
    
    user = User.query.filter_by(email_address=email).first()

    #print(user)

    if user:
        login_user(user, remember=True)
        return jsonify({
        "message": "Registration successful",
        "profile_picture_url": profile_picture_url
    }), 200
    else:
        print("User not registered")
        return jsonify({"message": "User not registered"}), 200

# def check_username_direct(username, bad_words):
#     username_lower = username.lower()
#     for word in bad_words:
#         if word.lower() in username_lower:
#             print(word.lower()) #for debugging
#             return False
#     return True

@bp.route('/validate_user/', methods=['POST']) 
def validate_user():
    json = request.json
    if not json:
        return jsonify({"valid": False, "message": "Invalid request"}), 400
    username = json.get('username')
    email = json.get('email')


    if username and User.query.filter_by(username=username).first():
        print("invalid 1")
        return jsonify({"valid": False, "message": "Username already in use"}), 400

    if email and User.query.filter_by(email_address=email).first():
        print("invalid 2")
        return jsonify({"valid": False, "message": "Email already in use"}), 400

    if username and profanity.contains_profanity(username):
        print("invalid 3")
        return jsonify({"valid": False, "message": "Username cannot contain inappropriate language"}), 400
    
    # if check_username_direct(username, bad_words) is False:
    #     print("invalid 4")
    #     return jsonify({"valid": False, "message": "Username cannot contain inappropriate language"}), 400

    if " " in username:
        print("invalid 5")
        return jsonify({"valid": False, "message": "Username cannot contain spaces"}), 400
        

    return jsonify({"valid": True, "message": "Valid"}), 200



@bp.route('/login/sso/', methods=['POST'])
def sso_login():
    data = request.json
    if not data:
        print("invalid request no data ")
        return jsonify({"message": "Invalid request. No data"}), 400
    token = data.get("token")

    decoded = jwt.decode(token, options={"verify_signature": False})
    print("DECODED TOKEN: ", decoded)
    exp = decoded.get("exp", 0)
    print(f"Token expires at: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(exp))}")


    if not token:
        print("invalid request no token")
        return jsonify({"message": "No token provided"}), 400

    decoded_token = validate_jwt(token)
    if not decoded_token:
        print("invalid token")
        return jsonify({"message": "Invalid token"}), 401

    email = decoded_token.get("preferred_username")  #email
    name = decoded_token.get("name")
    if name:
        name = name.split()
        fname = name[1].replace(",", "")
        lname = name[0]
    else:
        print("no name found")
        return jsonify({"message": "Invalid token: No name found"}), 401


    if not email:
        print("no email found")
        return jsonify({"message": "Invalid token: No email found"}), 401

    user = User.query.filter_by(email_address=email).first()

   # print(user)

    if user:
        print("logging in")
        login_user(user, remember=True)
        return jsonify({"message": "Login successful", "user_id": user.id}), 200
    else:
        print("User not registered")
        return jsonify({"message": "User not registered"}), 200

@bp.route('/get_initial_data/', methods=['POST'])
def get_initial_data():
    data = request.json
    if not data:
        return jsonify({"message": "Invalid request"}), 400
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


@bp.route('/logout/', methods=['POST'])
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

@bp.route('/current_user/', methods=['GET'])
def get_current_user():
    return current_user.to_json(), 200

@bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user_data = {
        "id": user.id,
        "fname": user.fname,
        "lname": user.lname,
        "email_address": user.email_address,
        "username": user.username,
        "profile_picture": user.profile_picture,
        "xp_points": user.xp_points,
        "user_level": user.user_level,
        "is_admin": user.is_admin,
        "num_recipes_completed": user.num_recipes_completed,
        "colonial_floor": user.colonial_floor,
        "colonial_side": user.colonial_side,
        "date_created": user.date_created.isoformat() if user.date_created else None,
        "last_logged_in": user.last_logged_in.isoformat() if user.last_logged_in else None,
        "num_reports": user.num_reports,
    }

    return jsonify(user_data), 200