from __future__ import annotations
from flask import Flask, request, render_template, redirect, url_for, abort, current_app, flash, session
from flask_sqlalchemy import SQLAlchemy
import os, sys
from datetime import datetime
from flask_login import UserMixin, LoginManager, login_required
from flask_login import login_user, logout_user, current_user

from hashing_examples import UpdatedHasher
from loginforms import RegisterForm, LoginForm

from sqlalchemy.dialects.mysql import JSON
import pandas

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

#class models for the database tables
class User(UserMixin, db.Model):
    __tablename__ = 'User'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fname = db.Column(db.String(50))
    lname = db.Column(db.String(50))
    email_address = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(50), nullable=False)
    profile_picture = db.Column(db.Text)
    xp_points = db.Column(db.Integer, nullable=False)
    user_level = db.Column(db.Integer, nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False)
    num_recipes_completed = db.Column(db.Integer, nullable=False)
    colonial_floor = db.Column(db.Enum('1', '2', '3', '4', 'ADMIN'))
    colonial_side = db.Column(db.Enum('Mens', 'Womens', 'ADMIN'))
    date_created = db.Column(db.DateTime, nullable=False)
    last_logged_in = db.Column(db.DateTime)
    num_reports = db.Column(db.Integer, nullable=False)
    password_hash = db.Column(db.LargeBinary, nullable=False)

    @property
    def password(self):
        raise AttributeError("password is a write-only attribute")
    @password.setter
    def password(self, pwd: str) -> None:
        self.password_hash = pwd_hasher.hash(pwd)
    # add a verify_password convenience method
    def verify_password(self, pwd: str) -> bool:
        return pwd_hasher.check(pwd, self.password_hash)

class UserBlock(db.Model):
    __tablename__ = 'UserBlock'
    blocked_user = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    blocked_by = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)


class Friendship(db.Model):
    __tablename__ = 'Friendship'
    user1 = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    user2 = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)

class DietaryRestriction(db.Model):
    __tablename__ = 'DietaryRestriction'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)

class UserDietaryRestriction(db.Model):
    __tablename__ = 'UserDietaryRestriction'
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    restriction_id = db.Column(db.Integer, db.ForeignKey('DietaryRestriction.id'), primary_key=True)

class Cuisine(db.Model):
    __tablename__ = 'Cuisine'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)

class UserCuisinePreference(db.Model):
    __tablename__ = 'UserCuisinePreference'
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    cuisine_id = db.Column(db.Integer, db.ForeignKey('Cuisine.id'), primary_key=True)

class UserGroup(db.Model):
    __tablename__ = 'UserGroup'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    image = db.Column(db.Text)
    description = db.Column(db.Text, nullable=False)
    is_public = db.Column(db.Boolean, nullable=False)
    num_reports = db.Column(db.Integer, nullable=False)

class GroupMember(db.Model):
    __tablename__ = 'GroupMember'
    group_id = db.Column(db.Integer, db.ForeignKey('UserGroup.id'), primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)

class GroupBannedMember(db.Model):
    __tablename__ = 'GroupBannedMember'
    group_id = db.Column(db.Integer, db.ForeignKey('UserGroup.id'), primary_key=True)
    banned_member_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)

class Message(db.Model):
    __tablename__ = 'Message'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_id = db.Column(db.Integer, db.ForeignKey('UserGroup.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    is_reported = db.Column(db.Boolean, nullable=False)
    text = db.Column(db.Text, nullable=False)

class Achievement(db.Model):
    __tablename__ = 'Achievement'
    id = db.Column(db.Integer, primary_key=True)
    image = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    completion_requirement = db.Column(db.Text, nullable=False)

class UserAchievement(db.Model):
    __tablename__ = 'UserAchievement'
    achievement_id = db.Column(db.Integer, db.ForeignKey('Achievement.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)

class Recipe(db.Model):
    __tablename__ = 'Recipe'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recipe_name = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.Enum('1', '2', '3', '4', '5'), nullable=False)
    xp_amount = db.Column(db.Integer, nullable=False)
    description = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    image = db.Column(db.Text, nullable=False)

class RecipeStep(db.Model):
    __tablename__ = 'RecipeStep'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    step_number = db.Column(db.Integer, primary_key=True)
    step_description = db.Column(db.Text, nullable=False)

class CookedRecipe(db.Model):
    __tablename__ = 'CookedRecipe'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    completed_by = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    date_completed = db.Column(db.DateTime, nullable=False)

class RecipeCuisine(db.Model):
    __tablename__ = 'RecipeCuisine'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    cuisine_id = db.Column(db.Integer, db.ForeignKey('Cuisine.id'), primary_key=True)

class Review(db.Model):
    __tablename__ = 'Review'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    image = db.Column(db.Text)
    rating = db.Column(db.Enum('1', '2', '3', '4', '5'), nullable=False)
    difficulty = db.Column(db.Enum('1', '2', '3', '4', '5'), nullable=False)
    num_reports = db.Column(db.Integer, nullable=False)

class Challenge(db.Model):
    __tablename__ = 'Challenge'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)
    creator = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    image = db.Column(db.Text)
    difficulty = db.Column(db.Enum('1', '2', '3', '4', '5'), nullable=False)
    theme = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.Text, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    is_complete = db.Column(db.Boolean, nullable=False)
    num_reports = db.Column(db.Integer, nullable=False)

class ChallengeResult(db.Model):
    __tablename__ = 'ChallengeResult'
    challenge_id = db.Column(db.Integer, db.ForeignKey('Challenge.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    challenge_rank = db.Column(db.Integer, nullable=False)

class ChallengeVote(db.Model):
    __tablename__ = 'ChallengeVote'
    challenge_id = db.Column(db.Integer, db.ForeignKey('Challenge.id'), primary_key=True)
    given_to = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    given_by = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)

class ChallengeParticipant(db.Model):
    __tablename__ = 'ChallengeParticipant'
    challenge_id = db.Column(db.Integer, db.ForeignKey('Challenge.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)

class RecommendedChallengeRecipe(db.Model):
    __tablename__ = 'RecommendedChallengeRecipe'
    challenge_id = db.Column(db.Integer, db.ForeignKey('Challenge.id'), primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)

class Ingredient(db.Model):
    __tablename__ = 'Ingredient'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ingredient_name = db.Column(db.Text, nullable=False)

class RecipeIngredient(db.Model):
    __tablename__ = 'RecipeIngredient'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=True)
    ingredient_name = db.Column(db.Text)
    quantity = db.Column(db.Integer, nullable=False)
    unit = db.Column(db.String(50), nullable=False)

class Substitution(db.Model):
    __tablename__ = 'Substitution'
    substituted = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=True)
    substituted_by = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=True)

class ShoppingList(db.Model):
    __tablename__ = 'ShoppingList'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)

class ShoppingListItem(db.Model):
    __tablename__ = 'ShoppingListItem'
    shopping_list_id = db.Column(db.Integer, db.ForeignKey('ShoppingList.id'), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=True)
    ingredient_quantity = db.Column(db.Integer, nullable=False)
    ingredient_quantity_unit = db.Column(db.Text)

class RecipeList(db.Model):
    __tablename__ = 'RecipeList'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)
    belongs_to = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)

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


with app.app_context():
    # Uncomment these if you make any changes to the object classes
    # WARNING: THIS WILL DELETE ALL CURRENTLY STORED OBJECTS
    #db.drop_all()
    #db.create_all()

    # uncomment to read in recipes (full_dataset.csv must be in root)
    """
    data = pandas.read_csv('full_dataset.csv')

    # NOTE: remove this to read in the full dataset
    data = data.head(20)

    for index, row in data.iterrows(): # type:ignore
        recipe = Recipe(
            recipe_name=row['title'], difficulty='3', xp_amount=50, description="No description provided", rating=0.0, image='') # type:ignore
        db.session.add(recipe)
        db.session.commit()

        ingredients = eval(row['NER'])
        for ingredient_name in ingredients:
            existing_ingredient = Ingredient.query.filter_by(ingredient_name=ingredient_name).first()
            if not existing_ingredient:
                existing_ingredient = Ingredient(ingredient_name=ingredient_name) # type:ignore
                db.session.add(existing_ingredient)
                db.session.commit()

            existing_recipe_ingredient = RecipeIngredient.query.filter_by(recipe_id=recipe.id, ingredient_id=existing_ingredient.id).first() 
            if not existing_recipe_ingredient:
                new_ingredient = RecipeIngredient(recipe_id=recipe.id, ingredient_id=existing_ingredient.id, ingredient_name=ingredient_name, quantity=-1, unit="temp") # type:ignore
                db.session.add(new_ingredient)
                db.session.commit()
            else:
                # NOTE: for some reason there occasionally is a duplicate RecipeIngredient, so this passes over it without crashing
                print("Ingredient already exists in this recipe")

        steps = eval(row['directions'])
        for step_number, step_description in enumerate(steps, start=1):
            recipe_step = RecipeStep(recipe_id=recipe.id, step_number=step_number, step_description=step_description) # type:ignore
            db.session.add(recipe_step)
    db.session.commit()
    """
   

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
            user = User(username=form.username.data, email_address=form.email.data, password=form.password.data, # type:ignore
                        xp_points=0, is_admin=False, num_recipes_completed=0, date_created=datetime.utcnow(),  # type:ignore
                        num_reports=0, user_level=1, fname="", lname="", colonial_floor="1", colonial_side="Mens",  # type:ignore
                        last_logged_in = datetime.utcnow()) # type:ignore
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