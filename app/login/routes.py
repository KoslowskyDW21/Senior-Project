from __future__ import annotations
from app.login import bp
from app.models import User, db
from app.login.loginforms import RegisterForm, LoginForm
from datetime import datetime
from flask import request, jsonify, render_template, redirect, url_for, flash, current_app
from flask_login import login_required
from flask_login import login_user, logout_user
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
    
    user = User.query.filter_by(email_address=email).first()
    if user is not None:
        return jsonify({"message": "There is already an account with that email address"}), 400

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

    # Handle profile picture upload if provided
    if profile_picture and allowed_file(profile_picture.filename):
        filename = secure_filename(profile_picture.filename)
        upload_folder = os.path.expanduser('~/School/Senior-Project/app/static/images/profile_pics')  # Using absolute path
        os.makedirs(upload_folder, exist_ok=True)

        # Check if the folder exists and is writable
        if not os.path.exists(upload_folder):
            return jsonify({"message": "Upload folder doesn't exist!"}), 500

        file_path = os.path.join(upload_folder, filename)
        try:
            profile_picture.save(file_path)
        except Exception as e:
            return jsonify({"message": f"Error saving file: {str(e)}"}), 500

        # Store the relative URL in the user's record
        profile_picture_url = f"/static/images/profile_pics/{filename}"
        new_user.profile_picture = profile_picture_url
        db.session.commit()
    else:
        profile_picture_url = None

    # Return a response with or without the profile picture URL
    return jsonify({
        "message": "Registration successful",
        "profile_picture_url": profile_picture_url
    }), 200

    



@bp.route('/api/login/', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email_address=email).first()
    if user is None or not user.verify_password(password):
        return jsonify({"message": "Invalid email or password"}), 400

    login_user(user)
    return jsonify({"message": "Login successful", "user_id": user.id}), 200

@bp.route('/api/logout/', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200
    
# @bp.get('/')
# def reroute():
#     return redirect(url_for('recipes.home'))

# @bp.get('/register/')
# def get_register():
#     form = RegisterForm()
#     return render_template('register.html', form=form)

# @bp.post('/register/')
# def post_register():
#     form = RegisterForm()
#     if form.validate():
#         # check if there is already a user with this email address
#         user = User.query.filter_by(email_address=form.email.data).first()
#         if user is not None:
#             flash('There is already an account with that email address')
#             return redirect(url_for('login.get_register'))
#         # check if there is already a user with this username
#         user = User.query.filter_by(username=form.username.data).first()
#         # if the email and username address is free, create a new user and send to login
#         if user is None:
#             user = User(username=form.username.data, email_address=form.email.data, password=form.password.data, # type:ignore
#                         xp_points=0, is_admin=False, num_recipes_completed=0, date_created=datetime.utcnow(),  # type:ignore
#                         num_reports=0, user_level=1, fname="", lname="", colonial_floor="1", colonial_side="Mens",  # type:ignore
#                         last_logged_in = datetime.utcnow()) # type:ignore
#             db.session.add(user)
#             db.session.commit()
#             return redirect(url_for('login.get_login'))
#         else: # if the user already exists
#             # flash a warning message and redirect to get registration form
#             flash('There is already an account with that username')
#             return redirect(url_for('login.get_register'))
#     else: # if the form was invalid
#         # flash error messages and redirect to get registration form again
#         for field, error in form.errors.items():
#             flash(f"{field}: {error}")
#         return redirect(url_for('login.get_register'))

# @bp.get('/login/')
# def get_login():
#     form = LoginForm()
#     return render_template('login.html', form=form)

# @bp.post('/login/')
# def post_login():
#     form = LoginForm()
#     if form.validate():
#         # try to get the user associated with this email address
#         user = User.query.filter_by(email_address=form.email.data).first()
#         # if this user exists and the password matches
#         if user is not None and user.verify_password(form.password.data):
#             # log this user in through the login_manager
#             login_user(user)
#             # redirect the user to the page they wanted or the home page
#             next = request.args.get('next')
#             if next is None or not next.startswith('/'):
#                 next = url_for('recipes.home')
#             return redirect(next)
#         else: # if the user does not exist or the password is incorrect
#             # flash an error message and redirect to login form
#             flash('Invalid email address or password')
#             return redirect(url_for('login.get_login'))
#     else: # if the form was invalid
#         # flash error messages and redirect to get login form again
#         for field, error in form.errors.items():
#             flash(f"{field}: {error}")
#         return redirect(url_for('login.get_login'))

# @bp.get('/logout/')
# @login_required
# def get_logout():
#     logout_user()
#     flash('You have been logged out')
#     return redirect(url_for('login.get_login'))