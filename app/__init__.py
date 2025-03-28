from flask import Flask, request, current_app
from config import Config
from flask_login import LoginManager
from flask_cors import CORS  
from app.models import User, UserGroup, UserNotifications, Recipe, RecipeIngredient, RecipeCuisine, RecipeStep, Ingredient, ShoppingList, ShoppingListItem, Cuisine, db
import string, random
from datetime import datetime
import requests
import os
import redis

login_manager = LoginManager()

def create_app(config=Config):
    app = Flask(__name__)
    app.config.from_object(config)
    print(config.SQLALCHEMY_DATABASE_URI) # TODO: remove debugging
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static', 'uploads')
    #max file size for uploads
    app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 2 MB limit
    # Allow requests only from React frontend
    CORS(app, origins="https://letthemcook.gcc.edu:443/", supports_credentials=True) 
    login_manager.init_app(app)
    login_manager.login_view = 'login.get_login' # type: ignore
    login_manager.session_protection = "strong"


    db.init_app(app)
    with app.app_context():
        # UNCOMMENT (and get rid of pass) TO REPOPULATE DATABASE
        # populate_database()
        #create_dummy_invite()

        pass
        

    app.url_map.strict_slashes = True
    from app.login import bp as login_bp
    app.register_blueprint(login_bp, url_prefix='/login')
    from app.recipes import bp as recipes_bp
    app.register_blueprint(recipes_bp, url_prefix='/recipes')
    from app.profile import bp as profile_bp
    app.register_blueprint(profile_bp, url_prefix='/profile')
    from app.recipe_lists import bp as recipe_lists_bp
    app.register_blueprint(recipe_lists_bp, url_prefix='/recipe_lists')
    from app.shopping_list import bp as shopping_list_bp
    app.register_blueprint(shopping_list_bp, url_prefix='/shopping_lists')
    from app.challenges import bp as challenge_bp
    app.register_blueprint(challenge_bp, url_prefix='/challenges')
    from app.ingredients import bp as ingredients_bp
    app.register_blueprint(ingredients_bp, url_prefix='/ingredients')
    from app.achievements import bp as achievement_bp
    app.register_blueprint(achievement_bp, url_prefix='/achievements')
    from app.settings import bp as settings_bp
    app.register_blueprint(settings_bp, url_prefix='/settings')
    from app.groups import bp as groups_bp
    app.register_blueprint(groups_bp, url_prefix='/groups')
    from app.admin import bp as admin_bp
    app.register_blueprint(admin_bp, url_prefix='/admin')
    from app.friends import bp as friends_bp
    app.register_blueprint(friends_bp, url_prefix='/friends')
    
    return app

@login_manager.user_loader
def load_user(uid: int) -> User | None:
    return User.query.get(int(uid))

def populate_database():
    db.drop_all()
    db.create_all()

    # Create admin at runtime
    admin = User(fname = "John", lname = "Smith", email_address = "admin@gmail.com", # type: ignore
    username = "ADMIN", profile_picture = "", xp_points = 0, user_level = 1, # type: ignore
    is_admin = True, num_recipes_completed = 0, colonial_floor = 'ADMIN', # type: ignore
    colonial_side = 'ADMIN', date_created = datetime.utcnow(), last_logged_in = datetime.utcnow(), # type: ignore
    num_reports = 0, password = "password") # type: ignore
    db.session.add(admin)

    for char in string.ascii_lowercase:
        url = f"https://www.themealdb.com/api/json/v1/1/search.php?f={char}"
        recipes = fetch_recipes(url)
        save_recipes_to_db(recipes)

def fetch_recipes(api_url):
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json().get("meals", [])
    else:
        raise Exception(f"Failed to fetch data: {response.status_code}")

def save_recipes_to_db(recipes):
    if not recipes:
        return
    for recipe_data in recipes:
        # Recipe
        difficulty = random.randint(1, 5)
        recipe = Recipe(
            recipe_name=recipe_data["strMeal"],  # type: ignore
            difficulty=str(difficulty),  # type: ignore
            xp_amount=100*difficulty,  # type: ignore
            rating=0,  # type: ignore
            image=recipe_data["strMealThumb"],  # type: ignore
            category=recipe_data["strCategory"], # type: ignore
            youtube_url=recipe_data["strYoutube"] # type: ignore
        )
        db.session.add(recipe)
        db.session.flush()

        # RecipeSteps
        steps = recipe_data["strInstructions"].split('. ')
        for i, step in enumerate(steps, start=1):
            if step.strip():
                recipe_step = RecipeStep(
                    recipe_id=recipe.id,  # type: ignore
                    step_number=i,  # type: ignore
                    step_description=step.strip()  # type: ignore
                )
                db.session.add(recipe_step)

        # Ingredients
        for i in range(1, 21):
            ingredient_name = recipe_data.get(f"strIngredient{i}")
            # End early if ingredient is empty
            if not ingredient_name or ingredient_name == "":
                break
            measure = recipe_data.get(f"strMeasure{i}")
            if ingredient_name and ingredient_name.strip():
                # Ensure Ingredient exists
                ingredient = Ingredient.query.filter_by(ingredient_name=ingredient_name.strip()).first()
                if not ingredient:
                    ingredient = Ingredient(ingredient_name=ingredient_name.strip()) # type: ignore
                    db.session.add(ingredient)
                    db.session.flush()

                # RecipeIngredients
                recipe_ingredient = RecipeIngredient(
                    recipe_id=recipe.id,  # type: ignore
                    ingredient_id=ingredient.id, # type: ignore
                    ingredient_name=ingredient_name.strip(), # type: ignore
                    measure=measure  # type: ignore
                )
                db.session.merge(recipe_ingredient)

        # Cuisines
        cuisine_name = recipe_data.get("strArea")
        if cuisine_name:
            # Ensure Cuisine exists
            cuisine = Cuisine.query.filter_by(name=cuisine_name.strip()).first()
            if not cuisine:
                cuisine = Cuisine(name=cuisine_name.strip()) # type: ignore
                db.session.add(cuisine)
                db.session.flush()

            # RecipeCuisines
            recipe_cuisine = RecipeCuisine(
                recipe_id=recipe.id,  # type: ignore
                cuisine_id=cuisine.id # type: ignore
            )
            db.session.add(recipe_cuisine)

    db.session.commit()


def create_dummy_invite():
    # Create a new UserNotifications object
    notification = UserNotifications(
        user_id=3,
        notification_text="You have been invited to join a challenge.",
        notification_type='challenge_reminder',
        isRead=0,
        challenge_id=29
    )

    # Add the notification to the session and commit
    db.session.add(notification)
    db.session.commit()