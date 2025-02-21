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
    is_super_admin = db.Column(db.Boolean, nullable=False)
    num_recipes_completed = db.Column(db.Integer, nullable=False)
    colonial_floor = db.Column(db.Enum('1', '2', '3', '4', 'ADMIN'))
    colonial_side = db.Column(db.Enum('Mens', 'Womens', 'ADMIN'))
    date_created = db.Column(db.DateTime, nullable=False)
    last_logged_in = db.Column(db.DateTime)
    num_reports = db.Column(db.Integer, nullable=False)
    is_banned = db.Column(db.Boolean, nullable=False)
    hasLeveled = db.Column(db.Boolean, nullable = False)

    @property
    def password(self):
        raise AttributeError("password is a write-only attribute")
    @password.setter
    def password(self, pwd: str) -> None:
        self.password_hash = pwd_hasher.hash(pwd)
    # add a verify_password convenience method
    def verify_password(self, pwd: str) -> bool:
        return pwd_hasher.check(pwd, self.password_hash)
    def to_json(self):
        return {
            "id": self.id,
            "fname": self.fname,
            "lname": self.lname,
            "email_address": self.email_address,
            "username": self.username,
            "profile_picture": self.profile_picture,
            "xp_points": self.xp_points,
            "user_level": self.user_level,
            "is_admin": self.is_admin,
            "is_super_admin": self.is_super_admin,
            "num_recipes_completed": self.num_recipes_completed,
            "colonial_floor": self.colonial_floor,
            "colonial_side": self.colonial_side,
            "date_created": self.date_created.isoformat() if self.date_created else None,
            "last_logged_in": self.last_logged_in.isoformat() if self.last_logged_in else None,
            "num_reports": self.num_reports,
            "is_banned": self.is_banned,
        }

    def __repr__(self):
        return (
            f"<User(id={self.id}, username='{self.username}', email_address='{self.email_address}', "
            f"fname='{self.fname}', lname='{self.lname}', colonial_floor='{self.colonial_floor}', "
            f"colonial_side='{self.colonial_side}', xp_points={self.xp_points}, is_admin={self.is_admin}, "
            f"is_super_admin={self.is_super_admin}, "
            f"num_recipes_completed={self.num_recipes_completed}, date_created={self.date_created}, "
            f"num_reports={self.num_reports}, user_level={self.user_level}, "
            f"last_logged_in={self.last_logged_in})>"
        )
    
    # TODO: Figure out why this method is broken
    # @staticmethod
    # def from_json(o: dict):
    #     return User(
    #         fname=o.get("fname"), #type: ignore
    #         lname=o.get("lname"), #type: ignore
    #         email_address=o.get("email_address"),
    #         username=o.get("username"),
    #         profile_picture=o.get("profile_picture"),
    #         xp_points=o.get("xp_points"),
    #         user_level=o.get("user_level"),
    #         is_admin=o.get("is_admin"),
    #         num_recipes_completed=o.get("num_recipes_completed"),
    #         colonial_floor=o.get("colonial_floor"),
    #         colonial_side=o.get("colonial_side"),
    #         date_created=o.get("date_created"),
    #         last_logged_in=o.get("last_logged_in"),
    #         num_reports=o.get("num_reports"),
    #     )

class UserBlock(db.Model):
    __tablename__ = 'UserBlock'
    blocked_user = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    blocked_by = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    def to_json(self):
        return {
            "blocked_user": self.blocked_user,
            "blocked_by": self.blocked_by,
        }


class Friendship(db.Model):
    __tablename__ = 'Friendship'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user1 = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    user2 = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    def to_json(self):
        return {
            "id": self.id,
            "user1": self.user1,
            "user2": self.user2,
        }

class DietaryRestriction(db.Model):
    __tablename__ = 'DietaryRestriction'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
        }

class UserDietaryRestriction(db.Model):
    __tablename__ = 'UserDietaryRestriction'
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    restriction_id = db.Column(db.Integer, db.ForeignKey('DietaryRestriction.id'), primary_key=True)
    def to_json(self):
        return {
            "user_id": self.user_id,
            "restriction_id": self.restriction_id,
        }

class Cuisine(db.Model):
    __tablename__ = 'Cuisine'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
        }

class UserCuisinePreference(db.Model):
    __tablename__ = 'UserCuisinePreference'
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    cuisine_id = db.Column(db.Integer, db.ForeignKey('Cuisine.id'), primary_key=True)
    numComplete = db.Column(db.Integer, nullable=False)
    userSelected = db.Column(db.Boolean, nullable = False)
    def to_json(self):
        return {
            "user_id": self.user_id,
            "cuisine_id": self.cuisine_id,
            "numComplete": self.numComplete,
            "userSelected": self.userSelected

        }

class UserGroup(db.Model):
    __tablename__ = 'UserGroup'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    creator = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    image = db.Column(db.Text)
    description = db.Column(db.Text, nullable=False)
    is_public = db.Column(db.Boolean, nullable=False)
    num_reports = db.Column(db.Integer, nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "creator": self.creator,
            "image": self.image,
            "description": self.description,
            "is_public": self.is_public,
            "num_reports": self.num_reports,
        }
    
class GroupReport(db.Model):
    __tablename__ = "GroupReport"
    group_id = db.Column(db.Integer, db.ForeignKey("UserGroup.id"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("User.id"), primary_key=True)
    reason = db.Column(db.String(255), nullable=False)

    def __str__(self):
        return f"Group {self.group_id} reported by User {self.user_id} because {self.reason}"
    
    def to_json(self):
        return {
            "group_id": self.group_id,
            "user_id": self.user_id,
            "reason": self.reason,
        }

class GroupMember(db.Model):
    __tablename__ = 'GroupMember'
    group_id = db.Column(db.Integer, db.ForeignKey('UserGroup.id'), primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    is_trusted = db.Column(db.Boolean, nullable=False)
    def to_json(self):
        return {
            "group_id": self.group_id,
            "member_id": self.member_id,
            "is_trusted": self.is_trusted,
        }

class GroupBannedMember(db.Model):
    __tablename__ = 'GroupBannedMember'
    group_id = db.Column(db.Integer, db.ForeignKey('UserGroup.id'), primary_key=True)
    banned_member_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    def to_json(self):
        return {
            "group_id": self.group_id,
            "banned_member_id": self.banned_member_id,
        }

class Message(db.Model):
    __tablename__ = 'Message'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_id = db.Column(db.Integer, db.ForeignKey('UserGroup.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    is_reported = db.Column(db.Boolean, nullable=False)
    text = db.Column(db.Text, nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "user_id": self.user_id,
            "is_reported": self.is_reported,
            "text": self.text,
        }

class Achievement(db.Model):
    __tablename__ = 'Achievement'
    id = db.Column(db.Integer, primary_key=True)
    image = db.Column(db.Text, nullable=False)
    title = db.Column(db.Text, nullable = False)
    isVisible = db.Column(db.Boolean, nullable = False)
    description = db.Column(db.Text, nullable = False)

    def to_json(self):
        return {
            "id": self.id,
            "image": self.image,
            "title": self.title,
            "isVisible": self.isVisible,
            "description": self.description

        }

class UserAchievement(db.Model):
    __tablename__ = 'UserAchievement'
    achievement_id = db.Column(db.Integer, db.ForeignKey('Achievement.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    def to_json(self):
        return {
            "achievement_id": self.achievement_id,
            "user_id": self.user_id,
        }

class Recipe(db.Model):
    __tablename__ = 'Recipe'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recipe_name = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.Enum('1', '2', '3', '4', '5'), nullable=False)
    xp_amount = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    image = db.Column(db.Text, nullable=False)
    youtube_url = db.Column(db.Text)
    category = db.Column(db.Text, nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "recipe_name": self.recipe_name,
            "difficulty": self.difficulty,
            "xp_amount": self.xp_amount,
            "rating": self.rating,
            "image": self.image,
        }

class RecipeStep(db.Model):
    __tablename__ = 'RecipeStep'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    step_number = db.Column(db.Integer, primary_key=True)
    step_description = db.Column(db.Text, nullable=False)
    def to_json(self):
        return {
            "recipe_id": self.recipe_id,
            "step_number": self.step_number,
            "step_description": self.step_description,
        }

class CookedRecipe(db.Model):
    __tablename__ = 'CookedRecipe'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    completed_by = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    date_completed = db.Column(db.DateTime, nullable=False)
    def to_json(self):
        return {
            "recipe_id": self.recipe_id,
            "completed_by": self.completed_by,
            "date_completed": self.date_completed.isoformat() if self.date_completed else None,
        }

class RecipeCuisine(db.Model):
    __tablename__ = 'RecipeCuisine'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    cuisine_id = db.Column(db.Integer, db.ForeignKey('Cuisine.id'), primary_key=True)
    def to_json(self):
        return {
            "recipe_id": self.recipe_id,
            "cuisine_id": self.cuisine_id,
        }

class Review(db.Model):
    __tablename__ = 'Review'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id', ondelete="CASCADE"), nullable=False)
    text = db.Column(db.Text, nullable=False)
    image = db.Column(db.Text)
    rating = db.Column(db.Enum('0', '0.5','1','1.5', '2','2.5', '3','3.5', '4','4.5', '5'), nullable=True)
    difficulty = db.Column(db.Enum('0','1', '2', '3', '4', '5'), nullable=True)
    num_reports = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id', ondelete="CASCADE"), nullable=False)
    username = db.Column(db.Text)
    def to_json(self):
        return {
            "id": self.id,
            "recipe_id": self.recipe_id,
            "text": self.text,
            "image": self.image,
            "rating": self.rating,
            "difficulty": self.difficulty,
            "num_reports": self.num_reports,
            "user_id": self.user_id,
            "username": self.username
        }

class ReviewReport(db.Model):
    __tablename__ = "ReviewReport"
    review_id = db.Column(db.Integer, db.ForeignKey("Review.id"), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("User.id"), primary_key=True)
    reason = db.Column(db.String(255), nullable=False)

    def __str__(self):
        return f"Review {self.review_id} reported by user {self.user_id} because {self.reason}"
    
    def to_json(self):
        return {
            "review_id": self.review_id,
            "user_id": self.user_id,
            "reason": self.reason
        }

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
    def to_json(self):
        return {
            "challenge_id": self.challenge_id,
            "user_id": self.user_id,
            "challenge_rank": self.challenge_rank,
        }

class ChallengeVote(db.Model):
    __tablename__ = 'ChallengeVote'
    challenge_id = db.Column(db.Integer, db.ForeignKey('Challenge.id'), primary_key=True)
    first_choice = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    second_choice = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=True)
    third_choice = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=True)
    given_by = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)

    def to_json(self):
        return {
            "challenge_id": self.challenge_id,
            "first_choice": self.first_choice,
            "second_choice": self.second_choice,
            "third_choice": self.third_choice,
            "given_by": self.given_by,
        }

class ChallengeParticipant(db.Model):
    __tablename__ = 'ChallengeParticipant'
    challenge_id = db.Column(db.Integer, db.ForeignKey('Challenge.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), primary_key=True)
    def to_json(self):
        return {
            "challenge_id": self.challenge_id,
            "user_id": self.user_id,
        }

class RecommendedChallengeRecipe(db.Model):
    __tablename__ = 'RecommendedChallengeRecipe'
    challenge_id = db.Column(db.Integer, db.ForeignKey('Challenge.id'), primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    def to_json(self):
        return {
            "challenge_id": self.challenge_id,
            "recipe_id": self.recipe_id,
        }

class Ingredient(db.Model):
    __tablename__ = 'Ingredient'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ingredient_name = db.Column(db.Text, nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "ingredient_name": self.ingredient_name,
        }

class RecipeIngredient(db.Model):
    __tablename__ = 'RecipeIngredient'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id', ondelete="CASCADE"), primary_key=True)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=True)
    ingredient_name = db.Column(db.Text)
    measure = db.Column(db.String(100), nullable=False, primary_key=True)
    def to_json(self):
        return {
            "recipe_id": self.recipe_id,
            "ingredient_id": self.ingredient_id,
            "ingredient_name": self.ingredient_name,
            "measure": self.measure,
        }

class Substitution(db.Model):
    __tablename__ = 'Substitution'
    substituted = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=True)
    substituted_by = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=True)
    def to_json(self):
        return {
            "substituted": self.substituted,
            "substituted_by": self.substituted_by,
        }

class ShoppingList(db.Model):
    __tablename__ = 'ShoppingList'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
        }

class ShoppingListItem(db.Model):
    __tablename__ = 'ShoppingListItem'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    shopping_list_id = db.Column(db.Integer, db.ForeignKey('ShoppingList.id'), primary_key=False)
    ingredient_id = db.Column(db.Integer, db.ForeignKey('Ingredient.id'), primary_key=False)
    measure = db.Column(db.Text)
    def to_json(self):
        return {
            "id": self.id,
            "shopping_list_id": self.shopping_list_id,
            "ingredient_id": self.ingredient_id,
            "measure": self.measure
        }

class RecipeList(db.Model):
    __tablename__ = 'RecipeList'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, nullable=False)
    belongs_to = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "belongs_to": self.belongs_to,
        }
    
class RecipeRecipeList(db.Model):
    __tablename__ = 'RecipeRecipeList'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    recipe_list_id = db.Column(db.Integer, db.ForeignKey('RecipeList.id'), primary_key=True)
    def to_json(self):
        return {
            "recipe_id": self.recipe_id,
            "recipe_list_id": self.recipe_list_id,
        }

class UserNotifications(db.Model):
    __tablename__ = 'UserNotifications'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    notification_text = db.Column(db.Text, nullable=False)
    isRead = db.Column(db.Integer, default=0, nullable=False)
    notification_type = db.Column(db.Enum('friend_request', 'group_message', 'challenge_reminder'), nullable=True)
    group_id = db.Column(db.Integer, db.ForeignKey('UserGroup.id'), nullable=True)
    def to_json(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "notification_text": self.notification_text,
            "isRead": self.isRead,
            "notification_type": self.notification_type,
            "group_id": self.group_id
        }

class FriendRequest(db.Model):
    __tablename__ = 'FriendRequest'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    requestFrom = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    requestTo = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)
    def to_json(self):
        return {
            "id": self.id,
            "requestFrom": self.requestFrom,
            "requestTo": self.requestTo
        }
    
class RecipeDietaryRestriction(db.Model):
    __tablename__ =  'RecipeDietaryRestriction'
    recipe_id = db.Column(db.Integer, db.ForeignKey('Recipe.id'), primary_key=True)
    dietary_restrictions = db.Column(db.Text)
    def  to_json(self): 
        return {
            "recipe_id": self.recipe_id,
            "dietary_restrictions": self.dietary_restrictions
        }