from __future__ import annotations
from flask import jsonify
from flask_login import current_user, login_required
from app.shopping_list import bp
from app.models import ShoppingList, ShoppingListItem

@bp.get("/user_lists")
def get_all_shopping_lists_of_current_user():
    print("Attempting to return all shopping lists of current user")
    shopping_lists = ShoppingList.query.filter_by(user_id=current_user.id).all()
    return jsonify([shopping_list.to_json() for shopping_list in shopping_lists])

@bp.get("/items/<int:id>")
def get_all_shopping_list_items_of_shopping_list(id):
    print(f"Attempting to return all shopping list items of shopping list {id}")
    shopping_list_items = ShoppingListItem.query.filter_by(shopping_list_id=id).all()
    return jsonify([shopping_list_item.to_json() for shopping_list_item in shopping_list_items])
