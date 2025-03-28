from __future__ import annotations
from flask import jsonify
from flask_login import current_user
from app.shopping_list import bp
from app.models import ShoppingList, ShoppingListItem, RecipeIngredient, RecipeRecipeList, Recipe, db
import sys

@bp.get("/user_list")
def get_all_shopping_lists_of_current_user():
    print("Attempting to return the shopping list of current user")
    shopping_list: ShoppingList | None = ShoppingList.query.filter_by(user_id=current_user.id).first()
    if (shopping_list is None):
        newList = ShoppingList(user_id=current_user.id) # type: ignore
        db.session.add(newList)
        db.session.commit()
    print(f"User {current_user.id}'s shopping list metadata: {shopping_list}")
    return jsonify(shopping_list.to_json()), 200 # type: ignore

@bp.get("/items/<int:id>")
def get_all_shopping_list_items_of_shopping_list(id):
    print(f"Attempting to return all shopping list items of shopping list {id}")
    shopping_list_items = ShoppingListItem.query.filter_by(shopping_list_id=id).all()
    # print(f"Shopping list items of shopping list {id}: {shopping_list_items}")
    return jsonify([shopping_list_item.to_json() for shopping_list_item in shopping_list_items]), 200

import re

@bp.post("/items/add/<int:recipe_id>")
def add_recipe_to_shopping_list_items_of_current_user(recipe_id):
    print(f"Trying to add recipe {recipe_id}'s ingredients to the shopping list of user number {current_user.id}")
    slis: list[ShoppingListItem] = []
    
    try:
        recipe_ingredients = RecipeIngredient.query.filter_by(recipe_id=recipe_id).all()
        print(f"RecipeIngredients: {recipe_ingredients}")
        curr_shopping_list = ShoppingList.query.filter_by(user_id=current_user.id).first()
        print(curr_shopping_list)
        
        if not curr_shopping_list:
            return jsonify({"message": "No shopping list found for user"}), 404
        
        for recipe_ingredient in recipe_ingredients:
            print(f"RecipeIngredient: {recipe_ingredient}")
            
            # Check if the ingredient is already in the shopping list
            existing_sli = ShoppingListItem.query.filter_by(
                shopping_list_id=curr_shopping_list.id,
                ingredient_id=recipe_ingredient.ingredient_id
            ).first()
            
            if existing_sli:
                # If ingredient exists, let's merge the measurements
                new_measurement = recipe_ingredient.measure
                existing_measurement = existing_sli.measure
                
                # Extract numeric and unit parts of both measurements
                try:
                    existing_num, existing_unit = extract_measurement(existing_measurement)
                    new_num, new_unit = extract_measurement(new_measurement)
                except ValueError:
                    print(f"Skipping invalid measurement format for {recipe_ingredient.ingredient_id}")
                    continue  # Skip this ingredient if the measurement format is invalid
                
                if existing_unit == new_unit:
                    # If units are the same, sum the numeric parts
                    total_num = existing_num + new_num
                    existing_sli.measure = f"{total_num}{existing_unit}"
                    print(f"Updated existing ingredient: {existing_sli}")
                else:
                    # If units are different, append as strings
                    existing_sli.measure = f"{existing_measurement}, {new_measurement}"
                    print(f"Updated existing ingredient with different units: {existing_sli}")
            else:
                # If ingredient does not exist, create a new shopping list item
                sli: ShoppingListItem = ShoppingListItem()
                sli.shopping_list_id = curr_shopping_list.id
                sli.ingredient_id = recipe_ingredient.ingredient_id
                sli.measure = recipe_ingredient.measure
                print(f"Adding new ingredient: {sli}")
                slis.append(sli)
                db.session.add(sli)

        db.session.commit()
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Error"}), 500
    return jsonify({"message": "Success"}), 200


def extract_measurement(measurement: str):
    """
    Extract the numeric and unit parts of a measurement.
    Example: "30g" -> (30, 'g'), "1tbsp" -> (1, 'tbsp'), "dash" -> (0, 'dash')
    """
    # First, check for non-numeric measurements like "dash", "pinch", etc.
    non_numeric_units = ["dash", "pinch", "cup", "tablespoon", "teaspoon", "tbsp", "tsp", "ml", "liter", "kg"]
    
    # Normalize measurement to lowercase
    measurement = measurement.strip().lower()

    if measurement in non_numeric_units:
        return 0, measurement  # Return 0 as the numeric part for non-numeric measurements
    
    # Now, try to match a numeric value followed by letters (unit)
    match = re.match(r"(\d+)([a-zA-Z]+)", measurement)
    
    if match:
        num = int(match.group(1))
        unit = match.group(2).lower()  # Normalize the unit to lowercase
        return num, unit
    else:
        # Handle invalid measurement format
        raise ValueError(f"Invalid measurement format: {measurement}")



@bp.post("/items/addlist/<int:recipe_list_id>")
def add_all_recipes_in_recipe_list_to_sl(recipe_list_id):
    print(f"Trying to add all recipes in recipe list id={recipe_list_id} to user's shopping list")
    try:
        recipe_relationships = RecipeRecipeList.query.filter_by(recipe_list_id=recipe_list_id).all()
        recipe_ids = [recipe_relationship.recipe_id for recipe_relationship in recipe_relationships]
        recipes = []
        slis = [] # ShoppingListItem[]
        curr_shopping_list = ShoppingList.query.filter_by(user_id=current_user.id).first()
        for recipe_id in recipe_ids:
            recipe = Recipe.query.filter_by(id=recipe_id).first()
            recipes.append(recipe)
        for recipe in recipes:
            recipe_ingredients = RecipeIngredient.query.filter_by(recipe_id=recipe.id)
            for recipe_ingredient in recipe_ingredients:
                sli: ShoppingListItem = ShoppingListItem()
                sli.shopping_list_id = curr_shopping_list.id
                sli.ingredient_id = recipe_ingredient.ingredient_id
                sli.measure = recipe_ingredient.measure
                slis.append(sli)
                db.session.add(sli)
        db.session.commit()
    except (Exception):
        print(f"Error:")
        return jsonify({"message": "Error"}), 500
    return jsonify({"message": "Success"}), 200

@bp.post("/items/remove/<int:sli_id>")
def remove_shopping_list_item_from_shopping_list_of_cu(sli_id):
    print(f"Trying to remove sli with id={sli_id} from db")
    try:
        sli = ShoppingListItem.query.filter_by(id=sli_id).first()
        db.session.delete(sli)
        db.session.commit()
        print(f"sli={sli_id} has been cast into the fire")
    except:
        print(f"Failed to remove sli={sli_id} from db", sys.stderr)
    return jsonify("It is done"), 200

@bp.post("items/remove-all")
def remove_all_shopping_list_items_from_shopping_list_of_cu():
    print(f"Trying to remove all slis from sli with id={current_user.id}")
    try:
        user_list = ShoppingList.query.filter_by(user_id=current_user.id).first()
        if user_list is None:
            print("User shopping list not found", file=sys.stderr)
            return jsonify("Sadge"), 500
        all_slis = ShoppingListItem.query.filter_by(shopping_list_id=user_list.id).all()
        if all_slis is None:
            print("Shopping list items of user list not found", file=sys.stderr)
            return jsonify("Sadge"), 500
        for sli in all_slis:
            db.session.delete(sli)
        db.session.commit()
        print("All shopping list items have been utterly committed to destruction")
        return jsonify("Hooray"), 200
    except:
        print(f"Failed to remove all shopping list items from current user's list", file=sys.stderr)
        return jsonify("Sadge"), 500

