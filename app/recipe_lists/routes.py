from __future__ import annotations
from flask import jsonify
from flask_login import current_user
from app.recipe_lists import bp
from app.models import Recipe, RecipeList, RecipeRecipeList, db

@bp.post("/<int:id>")
def post_array_of_recipes_in_list(id):
    print(f"searching for RecipeList {id}")
    recipe_ids = [rrl.recipe_id for rrl in (RecipeRecipeList.query.filter_by(recipe_list_id=id).all())]
    for id in recipe_ids:
        print(id)
    recipes = [Recipe.query.filter_by(id=recipe_id).first() for recipe_id in recipe_ids]
    for recipe in recipes:
        print(recipe.to_json()) # type: ignore
    return jsonify([recipe.to_json() for recipe in recipes]) # type: ignore
    