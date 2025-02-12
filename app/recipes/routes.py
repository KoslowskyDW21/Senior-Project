from __future__ import annotations
import math
from flask import request, jsonify, render_template, redirect, url_for, abort, flash, current_app
from flask_login import current_user, login_required
from app.recipes import bp
from app.models import UserAchievement, Recipe, RecipeStep, RecipeCuisine, UserCuisinePreference, Review, db
import os
import uuid
from werkzeug.utils import secure_filename

# @bp.get('/')
# def home():
#     return render_template('home.html', current_user=current_user, recipes=Recipe.query.all())

@bp.post("/")
def post_recipes():
    print("Fetching recipes")
    recipes = Recipe.query.all()
    return jsonify([recipe.to_json() for recipe in recipes])

@bp.get("/<int:id>/")
def get_recipe_page(id):
    print("searching for recipe " + str(id))
    recipe = Recipe.query.filter_by(id=id).first()
    if recipe is not None:
        return jsonify(recipe.to_json())
    return "<h1>404: recipe not found</h1>", 404

@bp.post("/steps/<int:id>")
def post_recipe_steps(id):
    print(f"searching for steps of recipe {id}")
    steps = RecipeStep.query.filter_by(recipe_id=id).all()
    if steps is not None:
        return jsonify([step.to_json() for step in steps])
    return f"<h1>404: steps not found for recipe {id}</h1>", 404


@bp.route("/completed/<int:id>/", methods  = ['POST'])
def post_completed_recipe_page(id):
    print("searching for recipe" + str(id))
    recipe = Recipe.query.filter_by(id=id).first()
    current_user.num_recipes_completed = current_user.num_recipes_completed + 1
    current_user.xp_points = current_user.xp_points + Recipe.query.filter_by(id = id).first().xp_amount # type: ignore
    db.session.add(current_user)
    db.session.flush()
    db.session.commit()
    if(current_user.num_recipes_completed == 1):
        completionAchievements(1)
    checkLevel()
    completeCuisine(recipe)
    if recipe is not None:
        return jsonify(recipe.to_json())
    return "<h1>404: recipe not found</h1>", 404

@bp.get("/addrecipe/")
def addrecipe():
        if(current_user.is_admin):
            return render_template('addrecipe.html')
        return  "<h1>401: unauthorized access"

@bp.post("/addrecipe/")
def post_addrecipe():
    diff = request.form.get("diff")
    if(diff is None):
        diff = 1
    recipe = Recipe(
            recipe_name= request.form.get('recipe'),  # type: ignore
            difficulty=str(diff),  # type: ignore
            xp_amount=100*int(diff),  # type: ignore
            rating=request.form.get("rat"),  # type: ignore
            image=request.form.get("img") # type: ignore
        )
    db.session.add(recipe)
    db.session.flush()
    db.session.commit()
    flash('recipe added successfully')
    return render_template('home.html', current_user=current_user, recipes=Recipe.query.all())

@bp.get("/api/del/<int:recipe_id>/")
def get_delete(recipe_id):
    return jsonify ({
        "id": recipe_id,
        "isAdmin": current_user.is_admin
    })

@bp.get("/del/")
def deleteHim():
    if(current_user.is_admin): 
        return render_template('deleterecipe.html')
    return  "<h1>401: unauthorized access"

@bp.post("/del/")
def delete_recipe():
    recipe = Recipe.query.filter(Recipe.id==request.form.get("id")).one()
    db.session.delete(recipe)
    db.session.commit()
    flash('recipe deleted successfully')
    return render_template('home.html', current_user=current_user, recipes=Recipe.query.all())

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route("/review/<int:id>/", methods=['POST'])
def upload_review(id):
    # Get review data from the request
    rating = request.form.get('rating')
    notes = request.form.get('notes')
    image = request.files.get('image')
    difficulty = request.form.get('difficulty')

    # Handle image upload
    image_path = None
    if image and allowed_file(image.filename):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        filename = f"{uuid.uuid4().hex}_{secure_filename(image.filename)}" # type: ignore
        file_path = os.path.join(upload_folder, filename)

        image.save(file_path)

        image_path = os.path.join('static', 'uploads', filename)

    if rating or notes or image or difficulty:
        if rating == "":
            rating = '0'
        if notes == "":
            notes = ""
        if difficulty == "":
            difficulty = '0'
        if image_path is None:
            image_path = "NULL"
        review = Review(recipe_id=id,text=notes,image=image_path,rating=rating,difficulty=difficulty, num_reports=0,author=current_user.id) # type: ignore
        db.session.add(review)
        db.session.commit()

        return jsonify({"message": "Review submitted successfully"}), 200

    return jsonify({"message": "No valid review data provided"}), 400

@bp.route("/reviews/<int:id>/", methods=['GET'])
def reviews(id):
    reviews = Review.query.filter_by(recipe_id  = id).all()
    return jsonify({
        "reviews": [review.to_json() for review in reviews],
    }), 200




def completionAchievements(id):
        specA = UserAchievement(achievement_id = id, user_id = current_user.id) #type:ignore
        print(specA)
        allUserAs = UserAchievement.query.all()
        run = True
        for a in allUserAs:
            if(a.user_id == specA.user_id and a.achievement_id == specA.achievement_id):
                run =  False
        if(run):
            print("here")
            db.session.add(specA)
            db.session.flush()
            db.session.commit()
            completedAchievement()

def checkLevel():
    startingLevel = current_user.user_level
    current_user.user_level = math.floor(.1 * math.sqrt(.1 * current_user.xp_points)) + 1 # type: ignore
    db.session.add(current_user)
    db.session.commit()
    if(startingLevel != current_user.user_level):
        current_user.hasLeveled = 1
        db.session.add(current_user)
        db.session.commit()

def completeCuisine(recipe):
    cid = RecipeCuisine.query.filter_by(recipe_id = recipe.id).first().cuisine_id # type: ignore
    if(UserCuisinePreference.query.filter_by(user_id = current_user.id, cuisine_id = cid).first() is None):
        entry = UserCuisinePreference(user_id = current_user.id, cuisine_id = cid, numComplete = 1, userSelected = 0) #type: ignore
    else:
        entry = UserCuisinePreference.query.filter_by(user_id = current_user.id, cuisine_id = cid).first()
        entry.numComplete = entry.numComplete + 1 #type: ignore
    db.session.add(entry)
    db.session.commit()
    count = 0
    for a in UserCuisinePreference.query.filter_by(user_id = current_user.id).all():
        if(a.numComplete > 0):
            count += 1
    if(count == 3):
        completionAchievements(2)

def completedAchievement():
    current_user.xp_points = current_user.xp_points + 100
    db.session.add(current_user)
    db.session.commit()
    checkLevel()
