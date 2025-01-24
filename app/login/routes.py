from __future__ import annotations
from app.login import bp
from app.models import User, db
from app.login.loginforms import RegisterForm, LoginForm
from datetime import datetime
from flask import request, jsonify, render_template, redirect, url_for, flash, current_app
from flask_login import login_required
from flask_login import current_user, login_user, logout_user
import os
from werkzeug.utils import secure_filename


#default route just for the time being
@bp.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the API!"}), 200

#File storage:
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# route for registering through API
#TODO: Add dietary restrictions to db
@bp.route('/api/register/', methods=['POST'])
def api_register():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password') 
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
        password=password,
        xp_points=0,
        is_admin=False,
        num_recipes_completed=0,
        date_created=datetime.utcnow(),
        num_reports=0,
        user_level=1,
        last_logged_in=datetime.utcnow()
    )

    db.session.add(new_user)
    db.session.commit()

    if profile_picture and allowed_file(profile_picture.filename):
        upload_folder = current_app.config['UPLOAD_FOLDER']

        os.makedirs(upload_folder, exist_ok=True)

        filename = secure_filename(profile_picture.filename)

        file_path = os.path.join(upload_folder, filename)
        profile_picture.save(file_path)

        relative_path = os.path.join('static', 'uploads', filename)
        new_user.profile_picture = relative_path
        profile_picture_url = relative_path

        db.session.commit()

    else:
        profile_picture_url = None

    return jsonify({
        "message": "Registration successful",
        "profile_picture_url": profile_picture_url
    }), 200


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


@bp.route('/api/login/', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email_address=email).first()
    if user is None or not user.verify_password(password):
        return jsonify({"message": "Invalid email or password"}), 400

    login_user(user, remember=True)
    print("Logged in:")
    print(current_user)
    print(user)
    return jsonify({"message": "Login successful", "user_id": user.id}), 200

@bp.route('/api/logout/', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200