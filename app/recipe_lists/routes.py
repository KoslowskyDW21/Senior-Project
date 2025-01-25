from __future__ import annotations
from flask import jsonify
from flask_login import current_user
from app.recipe_lists import bp
from app.models import Recipe, RecipeList, RecipeRecipeList, db

@bp.post("/<int:id>")
def post_array_of_recipes_in_list(id):
    print(f"searching for RecipeList {id}")
    recipe_list = RecipeList.query.filter_by(id=id).first()
    recipe_relations = RecipeRecipeList.query.filter_by(recipe_list_id=id).all()
    recipe_ids = [recipe_id for recipe_id in recipe_relations]
    recipes = [Recipe.query.filter_by(id=recipe_id).first() for recipe_id in recipe_ids] # TODO: ensure this gives Recipes and not None
    if recipe_list is not None:
        return jsonify([recipe.to_json() for recipe in recipes])
    return "<h1>404: RecipeList not found</h1>", 404