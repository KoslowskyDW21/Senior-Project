from __future__ import annotations
import math
from sqlalchemy import case, func, or_, and_
from flask import request, jsonify, render_template, redirect, url_for, abort, flash, current_app
from flask_login import current_user, login_required
from app.recipes import bp
from app.models import Achievement, UserAchievement, Recipe, RecipeStep, RecipeCuisine, UserCuisinePreference, Review, ReviewReport, Cuisine, RecipeDietaryRestriction, RecipeIngredient, UserNotifications, db
import os
import uuid
from werkzeug.utils import secure_filename
from math import ceil
from sqlalchemy.orm import aliased
import re



@bp.post("/")
def post_recipes():
    print("Fetching recipes")
    search_query = request.args.get('search_query', '').strip()  
    dietary_restrictions = request.args.getlist('dietary_restrictions[]')
    page = max(1, int(request.args.get('page', 1)))  
    per_page = int(request.args.get('per_page', 20))
    
    recipes_query = Recipe.query

    if dietary_restrictions:
        for i, restriction in enumerate(dietary_restrictions):
            # Create a new alias for each restriction
            dietary_restriction_alias = aliased(RecipeDietaryRestriction)
            print(f"Filtering by restriction {i+1}: {restriction}")
            
            recipes_query = recipes_query.join(
                dietary_restriction_alias, dietary_restriction_alias.recipe_id == Recipe.id
            ).filter(
                ~dietary_restriction_alias.dietary_restrictions.ilike(f"%{restriction}%")
            )
    else:
        print("No dietary restrictions provided")
    
    if search_query != "":
        if(search_query == "easter egg"):
            completionAchievements(current_user.id, 13)
        name_filter_start = Recipe.recipe_name.ilike(f"{search_query}%")
        name_filter_contains = Recipe.recipe_name.ilike(f"%{search_query}%")
        category_filter = Recipe.category.ilike(f"%{search_query}%")
        cuisine_filter = Cuisine.name.ilike(f"%{search_query}%")

        recipes_query = recipes_query.join(
            RecipeCuisine, RecipeCuisine.recipe_id == Recipe.id
        ).join(
            Cuisine, Cuisine.id == RecipeCuisine.cuisine_id
        )

        recipes_query = recipes_query.filter(
            or_(
                name_filter_start,
                name_filter_contains,
                category_filter,
                cuisine_filter
            )
        )

        recipes_query = recipes_query.order_by(
            name_filter_start.desc(),
            name_filter_contains.desc(),
            category_filter.desc(),
            cuisine_filter.desc()
        )
    
    else:
        print("No search query provided")

        review_alias = aliased(Review)
        recipes_query = recipes_query.outerjoin(review_alias, review_alias.recipe_id == Recipe.id)

        user_cuisine_alias = aliased(UserCuisinePreference)
        recipes_query = recipes_query.join(
            RecipeCuisine, RecipeCuisine.recipe_id == Recipe.id
        ).join(
            user_cuisine_alias, user_cuisine_alias.cuisine_id == RecipeCuisine.cuisine_id
        )

        user_rating_weight = case(
        (review_alias.user_id == current_user.id, 
        case(
          (review_alias.rating >= 0, -20), 
          else_=2)
         ),
        else_=0
        )

        recipe_rating_weight = case(
            (Recipe.rating >= 2.5, 2),
            else_=0
        )

        cuisine_preference_weight = case(
            (user_cuisine_alias.user_id == current_user.id, 5),
            else_=0
        )

        completion_weight = case(
            (user_cuisine_alias.numComplete > 20, 10),  
            (user_cuisine_alias.numComplete > 5, 5),  
            (user_cuisine_alias.numComplete > 0, 1),
        else_=0
        )

        total_weight = (user_rating_weight + recipe_rating_weight + cuisine_preference_weight + completion_weight)

        featured_recipes_query = recipes_query.add_columns(
            Recipe.id, 
            Recipe.recipe_name, 
            func.sum(func.coalesce(total_weight, 0)).label('total_weight')
        )

        recipes_query = recipes_query.group_by(Recipe.id)
        recipes_query = recipes_query.order_by(
            Recipe.recipe_name.asc()
        )

    # Now ensure featured_recipes_query is always defined
    if 'featured_recipes_query' in locals():
        # Query for featured recipes (top 4)
        featured_recipes_query = featured_recipes_query.group_by(Recipe.id)
        featured_recipes_query = featured_recipes_query.order_by(
            func.sum(total_weight).desc()
        )

        featured_recipes_query = featured_recipes_query.limit(4)
        for recipe in featured_recipes_query:
            print(recipe)

        # Execute the query to fetch featured recipes
        featured_recipes = [recipe[0].to_json() for recipe in featured_recipes_query.all()]
    else:
        featured_recipes = []

    # Paginate the main recipes
    recipes_paginated = recipes_query.paginate(page=page, per_page=per_page, error_out=False)  # type: ignore
    total_pages = ceil(recipes_paginated.total / per_page)  # type: ignore

    # Convert the results to JSON using `to_json()`
    if not search_query:
        recipes = [recipe.to_json() for recipe in recipes_paginated.items]
    else:
        recipes = [recipe.to_json() for recipe in recipes_paginated.items]

    # Return both featured and paginated recipes
    return jsonify({
        'featured_recipes': featured_recipes,
        'recipes': recipes,
        'total_pages': total_pages,
        'current_page': page
    }), 200


@bp.post("/user")
def getUserId():
    print (current_user.id)
    return jsonify({'id': current_user.id})

@bp.get("/all/")
def get_all_recipes_at_once():
    print("Fetching all recipes")
    recipes = Recipe.query.all()
    return jsonify({'recipes': [recipe.to_json() for recipe in recipes]})

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

@bp.post("/ingredients/<int:id>")
def post_recipe_ingredients(id):
    ingredients = RecipeIngredient.query.filter_by(recipe_id = id).all()
    if ingredients is not None:
        return jsonify([i.to_json() for i in ingredients]), 200
    return f"<h1>404: ingredients not found for recipe {id}</h1>", 404

@bp.route("/completed/<int:id>/", methods  = ['POST'])
def post_completed_recipe_page(id):
    print("searching for recipe" + str(id))
    recipe = Recipe.query.filter_by(id=id).first()
    current_user.num_recipes_completed = current_user.num_recipes_completed + 1
    current_user.xp_points = current_user.xp_points + Recipe.query.filter_by(id = id).first().xp_amount # type: ignore
    db.session.add(current_user)
    db.session.flush()
    db.session.commit()
    if(id == 229):
        completionAchievements(current_user.id, 5)
    if(str(Recipe.query.filter_by(id = id).first().difficulty) == "5"): #type:ignore
        completionAchievements(current_user.id, 12)
    if(current_user.num_recipes_completed == 1):
        completionAchievements(current_user.id, 1)
    elif(current_user.num_recipes_completed >= 50):
        completionAchievements(current_user.id, 7)
    elif(current_user.num_recipes_completed >= 10):
        completionAchievements(current_user.id, 6)
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

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route("/review/<int:id>/", methods=['POST'])
def upload_review(id):
    # Get review data from the request
    rating = request.form.get('rating')
    notes = request.form.get('notes')
    image = request.files.get('image')
    difficulty = request.form.get('difficulty')

    print(rating)

    if(str(rating) == "0.5"):
        completionAchievements(current_user.id, 9)
    elif(str(rating) == "5"):
        completionAchievements(current_user.id, 8)

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
        review = Review(recipe_id=id,text=notes,image=image_path,rating=rating,difficulty=difficulty, num_reports=0,user_id=current_user.id, username = current_user.username) # type: ignore
        db.session.add(review)
        db.session.commit()

        return jsonify({"message": "Review submitted successfully"}), 200

    return jsonify({"message": "No valid review data provided"}), 400

@bp.route("/reviews/<int:id>/", methods=['GET'])
def reviews(id):
    reviews = Review.query.filter_by(recipe_id=id).all()
    
    # Fetch the IDs of the reviews that have been reported by the current user
    reported_review_ids = [
        report.review_id for report in ReviewReport.query.filter_by(user_id=current_user.id).all()
    ]
    
    # Filter out the reviews that have been reported
    unreported_reviews = [review for review in reviews if review.id not in reported_review_ids]
    
    return jsonify({
        "reviews": [review.to_json() for review in unreported_reviews],
    }), 200

@bp.route("/reported_reviews", methods=["GET"])
@login_required
def get_reported_reviews():
    reportedReviews = Review.query.filter(Review.num_reports > 0).all()
    return jsonify([review.to_json() for review in reportedReviews]), 200

@bp.route("/<int:review_id>/delete_reports", methods=["DELETE"])
@login_required
def delete_reports(review_id: int):
    reports = ReviewReport.query.filter_by(review_id=review_id).all()

    for report in reports:
        db.session.delete(report)

    db.session.commit()
    return jsonify({"message": "Reports successfully deleted"}), 200

@bp.route("/<int:review_id>/set_reports_zero", methods=["POST"])
@login_required
def set_reports_zero(review_id: int):
    review: Review = Review.query.get(review_id) # type: ignore
    print(review)
    review.num_reports = 0

    db.session.commit()
    return jsonify({"message": "Dismissed all reports"}), 200

@bp.route("/<int:review_id>/delete", methods=["DELETE"])
@login_required
def delete_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"message": "Review not found"}), 404
    
    db.session.delete(review)
    db.session.commit()

    return jsonify({"message": "Review deleted successfully"}), 200

@bp.get("/<int:review_id>/report")
@login_required
def get_report_review(review_id: int):
    user = current_user._get_current_object()

    report = ReviewReport.query.filter_by(user_id=user.id, review_id=review_id).first() # type: ignore

    if report != None:
        return jsonify({"alreadyReported": True, "id": user.id}) # type: ignore
    
    return jsonify({"alreadyReported": False, "id": user.id}) # type: ignore

@bp.post("/<int:review_id>/report")
@login_required
def post_report_review(review_id: int):
    data = request.get_json()
    userId = data.get("user_id")
    reviewId = data.get("review_id")
    reason = data.get("reason")

    print("Received data - userID: " + str(userId))
    print("Received data - reviewID: " + str(review_id))
    print("Received data - reason: " + str(reason))

    newReport: ReviewReport = ReviewReport(review_id=reviewId, user_id=userId, reason=reason) # type: ignore
    print(newReport)
    review: Review = Review.query.filter_by(id=reviewId).first() # type: ignore
    review.num_reports += 1

    try:
        db.session.add(newReport)
        db.session.commit()
        return jsonify({"message": f"Review {reviewId} reported"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error reporting review: {e}")
        return jsonify({"message": "Error: could not report review"}), 500
    
@bp.route("/reports/<int:id>", methods=["GET"])
@login_required
def get_reports(id: int):
    reports = ReviewReport.query.filter_by(review_id=id).all()
    return jsonify([report.to_json() for report in reports]), 200


def completionAchievements(uid, id):
        specA = UserAchievement(achievement_id = id, user_id = uid) #type:ignore
        print(specA)
        allUserAs = UserAchievement.query.all()
        run = True
        for a in allUserAs:
            if(a.user_id == specA.user_id and a.achievement_id == specA.achievement_id):
                run =  False
        if(run):
            aTitle = Achievement.query.filter_by(id = id).first()
            db.session.add(specA)
            db.session.flush()
            db.session.commit()
            completedAchievement()
            notification = UserNotifications(
                user_id = current_user.id ,#type:ignore
                notification_text=f"You have earned a new achievement: {aTitle.title}.", #type: ignore
                notification_type='achievement', #type: ignore
                achievement_id=specA.achievement_id #type: ignore
            )
            db.session.add(notification)
            db.session.commit()

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
    if(count >= 3):
        completionAchievements(current_user.id, 2)
    elif(count >= 29):
        completionAchievements(current_user.id, 10)

def completedAchievement():
    current_user.xp_points = current_user.xp_points + 100
    db.session.add(current_user)
    db.session.commit()
    checkLevel()





