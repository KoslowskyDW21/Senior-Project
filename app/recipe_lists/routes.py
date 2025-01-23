from __future__ import annotations
from flask import jsonify
from flask_login import current_user
from app.recipe_lists import bp
from app.models import RecipeList, db

@bp.post("/<int:id>")
def post_recipe_list(id):
    print(f"searching for RecipeList {id}")
    recipe_list = RecipeList.query.filter_by(id=id).first()
    if recipe_list is not None:
        return jsonify(recipe_list.to_json())
    return "<h1>404: RecipeList not found</h1>", 404