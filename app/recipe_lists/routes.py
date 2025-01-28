from __future__ import annotations
from flask import jsonify
from flask_login import current_user
from app.recipe_lists import bp
from app.models import Recipe, RecipeList, RecipeRecipeList, db

@bp.post("/<int:id>")
def post_array_of_recipes_in_list(id):
    print(f"searching for RecipeList {id}")
    recipe_ids = [rrl.recipe_id for rrl in (RecipeRecipeList.query.filter_by(recipe_list_id=id).all())]
    recipes = [Recipe.query.filter_by(id=recipe_id).first() for recipe_id in recipe_ids]
    return jsonify([recipe.to_json() for recipe in recipes]) # type: ignore

@bp.post("/all")
def post_all_recipe_lists_of_current_user():
    print(f"Attempting to return all recipe lists of the current user")
    recipe_lists = RecipeList.query.filter_by(id=current_user.id)
    return jsonify([recipe_list.to_json() for recipe_list in recipe_lists])
    