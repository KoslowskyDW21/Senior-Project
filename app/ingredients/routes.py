from __future__ import annotations
from flask import jsonify
from app.ingredients import bp
from app.models import Ingredient, RecipeIngredient, ShoppingListItem

@bp.get("/<int:id>")
def get_ingredient(id):
    print(f"Getting ingredient of id {id}")
    ingredient = Ingredient.query.filter_by(id=id).first()
    return jsonify(ingredient), 200

@bp.get("/recipe/<int:recipe_id>")
def get_ingredients_of_recipe(recipe_id):
    print(f"Getting recipeIngredients of recipe {recipe_id}")
    recipeIngredients = RecipeIngredient.query.filter_by(recipe_id=recipe_id).all()
    return jsonify([recipeIngredient.to_json() for recipeIngredient in recipeIngredients]), 200

@bp.get("/shopping_list/<int:shopping_list_id>")
def get_ingredients_for_shopping_list(shopping_list_id):
    print(f"Gettings ingredients for shopping list {shopping_list_id}")
    shopping_list_items = ShoppingListItem.query.filter_by(shopping_list_id=shopping_list_id).all()
    ingredient_ids = [shopping_list_item.ingredient_id for shopping_list_item in shopping_list_items]
    ingredients = [Ingredient.query.filter_by(id=ingredient_id).first() for ingredient_id in ingredient_ids]
    #for ingredient in ingredients:
        # print(ingredient.ingredient_name) #type: ignore
    return jsonify([ingredient.to_json() for ingredient in ingredients]), 200 # type:ignore