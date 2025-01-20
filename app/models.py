from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from .hashing_examples import UpdatedHasher
import os

db = SQLAlchemy()

# open and read the contents of the pepper file into your pepper key
scriptdir = os.path.abspath(os.path.dirname(__file__))
pepfile = os.path.join(scriptdir, "pepper.bin")
with open(pepfile, 'rb') as fin:
    pepper_key = fin.read()
    # create a new instance of UpdatedHasher using that pepper key
    pwd_hasher = UpdatedHasher(pepper_key)

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
    title = db.Column(db.Text, nullable = False)
    isVisible = db.Column(db.Boolean, nullable = False)
    isComplete = db.Column(db.Boolean, nullable = False)

    def to_json(self):
        return {
            "id": self.id,
            "image": self.image,
            "title": self.title,
            "isVisible": self.isVisible,
            "isComplete": self.isComplete

        }

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
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id', ondelete="CASCADE"), nullable=False)
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
    location = db.Column(db.Text, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    is_complete = db.Column(db.Boolean, nullable=False)
    num_reports = db.Column(db.Integer, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "creator": self.creator,
            "image": self.image if self.image else None,
            "difficulty": self.difficulty,
            "theme": self.theme,
            "location": self.location,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "is_complete": self.is_complete,
            "num_reports": self.num_reports,
        }

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
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id', ondelete="CASCADE"), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=True)
    ingredient_name = db.Column(db.Text)
    measure = db.Column(db.String(100), nullable=False, primary_key=True)

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