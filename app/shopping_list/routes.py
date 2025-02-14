from __future__ import annotations
from flask import jsonify
from flask_login import current_user, login_required
from app.shopping_list import bp
from app.models import ShoppingList, ShoppingListItem, RecipeIngredient, db

@bp.get("/user_list")
def get_all_shopping_lists_of_current_user():
    print("Attempting to return the shopping list of current user")
    shopping_list: ShoppingList | None = ShoppingList.query.filter_by(user_id=current_user.id).first()
    if (shopping_list is None):
        newList = ShoppingList(user_id=current_user.id)
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

@bp.post("/items/add/<int:recipe_id>")
def add_recipe_to_shopping_list_items_of_current_user(recipe_id):
    print(f"Trying to add recipe {recipe_id}'s ingredients to the shopping list of user number {current_user.id}")
    slis: list[ShoppingListItem] = []
    try:
        recipe_ingredients = RecipeIngredient.query.filter_by(recipe_id=recipe_id).all()
        print(f"RecipeIngredients: {recipe_ingredients}")
        curr_shopping_list = ShoppingList.query.filter_by(user_id=current_user.id).first()
        print(curr_shopping_list)
        for recipe_ingredient in recipe_ingredients:
            print(f"RecipeIngredient: {recipe_ingredient}")
            sli: ShoppingListItem = ShoppingListItem()
            sli.shopping_list_id = curr_shopping_list.id
            sli.ingredient_id = recipe_ingredient.ingredient_id
            sli.measure = recipe_ingredient.measure
            print(sli)
            slis.append(sli)
            db.session.add(sli)
        db.session.commit()
    except:
        print("Error")
        return jsonify({"message": "Error", "objects": None}), 500
    return jsonify({"message": "Success", "objects": slis}), 200

@bp.post("/items/remove/<int:sli_id>")
def remove_shopping_list_item_from_shopping_list_of_cu(sli_id):
    print(f"Trying to remove sli with id={sli_id} from db")
    try:
        sli = ShoppingListItem.query.filter_by(id=sli_id).first()
        db.session.delete(sli)
        db.session.commit()
        print(f"sli={sli_id} has been cast into the fire")
    except:
        print(f"Failed to remove sli={sli_id} from db")
    return jsonify("It is done"), 200
