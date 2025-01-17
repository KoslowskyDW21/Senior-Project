from __future__ import annotations
from flask import request, jsonify, render_template, redirect, url_for, flash
from datetime import datetime
from flask_login import login_required
from flask_login import login_user, logout_user
from app.login import bp
from app.models import User, db
from app.login.loginforms import RegisterForm, LoginForm

# route for registering through API
@bp.route('/api/register/', methods=['POST'])
def api_register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email_address=email).first()
    if user is not None:
        return jsonify({"message": "There is already an account with that email address"}), 400
    
    new_user = User(username=username, email_address=email, password=password, xp_points=0, 
                    is_admin=False, num_recipes_completed=0, date_created=datetime.utcnow(),
                    num_reports=0, user_level=1, fname="", lname="", colonial_floor="1", 
                    colonial_side="Mens", last_logged_in=datetime.utcnow())
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 200

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