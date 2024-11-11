from flask import Flask, request, render_template, redirect, url_for, abort
from flask import flash
from flask_sqlalchemy import SQLAlchemy

# make sure the script's directory is in Python's import path
# this is only required when run from a different directory
import os, sys
script_dir = os.path.abspath(os.path.dirname(__file__))
sys.path.append(script_dir)

app = Flask(__name__)

scriptdir = os.path.abspath(os.path.dirname(__file__))
dbpath = os.path.join(scriptdir, 'database.sqlite3')
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{dbpath}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'correcthorsebatterystapler'

class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Unicode, nullable=False)
    email = db.Column(db.Unicode, nullable=False)
    passwordHash = db.Column(db.Unicode, nullable=False)
    profilePicture = db.Column(db.Unicode)
    experience = db.Column(db.Integer)
    level = db.Column(db.Integer)
    isAdmin = db.Column(db.Boolean)
    floor = db.Column(db.Unicode)
    side = db.Column(db.Unicode)
    completedRecipes = db.Column(db.relationship('Recipe'))
    blockedUsers = db.Column(db.relationship('User'))
    friends = db.Column(db.relationship('User'))
    dietaryRestrictions = db.Column(db.relationship('DietaryRestriction'))
    completedAchievements = db.Column(db.relationship('Achievement'))
    joinedGroups = db.Column(db.relationship('Group'))
    preferredCuisines = db.Column(db.relationship('Cuisine'))
    def __str__(self):
        return f"{self.id}: {self.username}"
    def __repr__(self):
        return f"User({self.id})"

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

@app.get('/')
def index():
    return render_template('index.html')