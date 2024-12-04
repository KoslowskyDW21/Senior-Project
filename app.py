from __future__ import annotations
from flask import Flask, request, render_template, redirect, url_for, abort, current_app, flash, session
from flask_sqlalchemy import SQLAlchemy
import os, sys
from flask_login import UserMixin, LoginManager, login_required
from flask_login import login_user, logout_user, current_user

from hashing_examples import UpdatedHasher
from loginforms import RegisterForm, LoginForm

#script_dir = os.path.abspath(os.path.dirname(__file__))
#sys.path.append(script_dir)

#scriptdir = os.path.abspath(os.path.dirname(__file__))
#dbpath = os.path.join(scriptdir, 'database.sqlite3')
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'idontknowwhattowriteforagoodkey'
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://username:intellectuallychallengeddata@10.18.101.49:3306/sys"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# open and read the contents of the pepper file into your pepper key
# NOTE: you should really generate your own and not use the one from the starter
scriptdir = os.path.abspath(os.path.dirname(__file__))
pepfile = os.path.join(scriptdir, "pepper.bin")
with open(pepfile, 'rb') as fin:
  pepper_key = fin.read()

# create a new instance of UpdatedHasher using that pepper key
pwd_hasher = UpdatedHasher(pepper_key)

class User(UserMixin, db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Unicode, nullable=False)
    email_address = db.Column(db.Unicode, nullable=False)
    passwordHash = db.Column(db.LargeBinary)
    is_admin = db.Column(db.Boolean)
    #profilePicture = db.Column(db.Unicode)
    #experience = db.Column(db.Integer)
    #level = db.Column(db.Integer)
    #floor = db.Column(db.Unicode)
    #side = db.Column(db.Unicode)
    #completedRecipes = db.Column(db.relationship('Recipe'))
    #blockedUsers = db.Column(db.relationship('User'))
    #friends = db.Column(db.relationship('User'))
    #dietaryRestrictions = db.Column(db.relationship('DietaryRestriction'))
    #completedAchievements = db.Column(db.relationship('Achievement'))
    #joinedGroups = db.Column(db.relationship('Group'))
    #preferredCuisines = db.Column(db.relationship('Cuisine'))
    # make a write-only password property that just updates the stored hash
    @property
    def password(self):
        raise AttributeError("password is a write-only attribute")
    @password.setter
    def password(self, pwd: str) -> None:
        self.passwordHash = pwd_hasher.hash(pwd)
    # add a verify_password convenience method
    def verify_password(self, pwd: str) -> bool:
        return pwd_hasher.check(pwd, self.passwordHash)

"""
class Recipe(db.Model):
    __tablename__ = 'Recipes'

class Ingredient(db.Model):
    __tablename__ = 'Ingredient'

class Review(db.Model):
    __tablename__ = 'Reviews'

class Achievement(db.Model):
    __tablename__ = 'Achievements'

class Challenge(db.Model):
    __tablename__ = 'Challenges'

class Cuisine(db.Model):
    __tablename__ = 'Cuisines'

class CompletionRequirement(db.Model):
    __tablename__ = 'CompletionRequirements'

class Group(db.Model):
    __tablename__ = 'Groups'

class DietaryRestriction(db.Model):
    __tablename__ = 'DietaryRestrictions'

class ShoppingList(db.Model):
    __tablename__ = 'ShoppingLists'

class RecipeList(db.Model):
    __tablename__ = 'RecipeLists'
"""

# Prepare and connect the LoginManager to this app
login_manager = LoginManager()
login_manager.init_app(app)
# function name of the route that has the login form (so it can redirect users)
login_manager.login_view = 'get_login' # type: ignore
login_manager.session_protection = "strong"
# function that takes a user id and
@login_manager.user_loader
def load_user(uid: int) -> User|None:
    return User.query.get(int(uid))

# remember that all database operations must occur within an app context
with app.app_context():
    pass
    #db.create_all() # this is only needed if the database doesn't already exist
    # create admin accounts at runtime
    #user1 = User(username='David', email='david@gcc.edu', password='password', isAdmin=True) # type:ignore
    #user2 = User(username='Jackson', email='jackson@gcc.edu', password='password', isAdmin=True) # type:ignore
    #user3 = User(username='Andrew', email='andrew@gcc.edu', password='password', isAdmin=True) # type:ignore
    #user4 = User(username='Jeff', email='jeff@gcc.edu', password='password', isAdmin=True) # type:ignore
    #user5 = User(username='Kate', email='kate@gcc.edu', password='password', isAdmin=True) # type:ignore
    #db.session.add_all((user1, user2, user3, user4, user5))
    #db.session.commit()

@app.get('/register/')
def get_register():
    form = RegisterForm()
    return render_template('register.html', form=form)

@app.post('/register/')
def post_register():
    form = RegisterForm()
    if form.validate():
        # check if there is already a user with this email address
        user = User.query.filter_by(email_address=form.email.data).first()
        if user is not None:
            flash('There is already an account with that email address')
            return redirect(url_for('get_register'))
        # check if there is already a user with this username
        user = User.query.filter_by(username=form.username.data).first()
        # if the email and username address is free, create a new user and send to login
        if user is None:
            user = User(username=form.username.data, email_address=form.email.data, password=form.password.data, is_Admin=False) # type:ignore
            db.session.add(user)
            db.session.commit()
            return redirect(url_for('get_login'))
        else: # if the user already exists
            # flash a warning message and redirect to get registration form
            flash('There is already an account with that username')
            return redirect(url_for('get_register'))
    else: # if the form was invalid
        # flash error messages and redirect to get registration form again
        for field, error in form.errors.items():
            flash(f"{field}: {error}")
        return redirect(url_for('get_register'))

@app.get('/login/')
def get_login():
    form = LoginForm()
    return render_template('login.html', form=form)

@app.post('/login/')
def post_login():
    form = LoginForm()
    if form.validate():
        # try to get the user associated with this email address
        user = User.query.filter_by(email_address=form.email.data).first()
        # if this user exists and the password matches
        if user is not None and user.verify_password(form.password.data):
            # log this user in through the login_manager
            login_user(user)
            # redirect the user to the page they wanted or the home page
            next = request.args.get('next')
            if next is None or not next.startswith('/'):
                next = url_for('index')
            return redirect(next)
        else: # if the user does not exist or the password is incorrect
            # flash an error message and redirect to login form
            flash('Invalid email address or password')
            return redirect(url_for('get_login'))
    else: # if the form was invalid
        # flash error messages and redirect to get login form again
        for field, error in form.errors.items():
            flash(f"{field}: {error}")
        return redirect(url_for('get_login'))

@app.get('/logout/')
@login_required
def get_logout():
    logout_user()
    flash('You have been logged out')
    return redirect(url_for('index'))

@app.get('/')
def index():
    return render_template('home.html', current_user=current_user)