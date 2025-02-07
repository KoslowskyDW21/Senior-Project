from __future__ import annotations
from flask import jsonify
from app.ingredients import bp
from app.models import Ingredient, RecipeIngredient, ShoppingListItem

@bp.get("/<int:id>")
def get_ingredient(id):
    print(f"Getting ingredient of id {id}")
    ingredient = Ingredient.query.filter_by(id=id).first()
    return jsonify(ingredient)

@bp.get("/<int:recipe_id>")
def get_ingredients_of_recipe(recipe_id):
    print(f"Getting ingredients of recipe {recipe_id}")
    ingredients = RecipeIngredient.query.filter_by(recipe_id=recipe_id).all()
    return jsonify([ingredient.to_json() for ingredient in ingredients])