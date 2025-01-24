from __future__ import annotations
from flask import request, jsonify, render_template, redirect, url_for, abort, flash
from flask_login import current_user
from app.recipes import bp
from app.models import UserAchievement, Recipe, db

# @bp.get('/')
# def home():
#     return render_template('home.html', current_user=current_user, recipes=Recipe.query.all())

@bp.post("/")
def post_recipes():
    print("Fetching recipes")
    recipes = Recipe.query.all()
    return jsonify([recipe.to_json() for recipe in recipes])

@bp.post("/<int:id>/")
def post_recipe_page(id):
    print("searching for recipe " + str(id))
    recipe = Recipe.query.filter_by(id=id).first()
    if recipe is not None:
        return jsonify(recipe.to_json())
    return "<h1>404: recipe not found</h1>", 404

@bp.post("/completed/<int:id>/")
def post_completed_recipe_page(id):
    print("searching for recipe" + str(id))
    recipe = Recipe.query.filter_by(id=id).first()
    nc = current_user.num_recipes_completed
    current_user.num_recipes_completed = nc + 1
    db.session.add(current_user)
    db.session.flush()
    db.session.commit()
    completionAchievements()
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

def completionAchievements():
    if(current_user.num_recipes_completed == 1):
        a = UserAchievement(achievement_id = 1, user_id = current_user.id) #type:ignore
        b = UserAchievement.query.all()
        if(a not in b):
            db.session.add(a)
            db.session.flush()
            db.session.commit()
        