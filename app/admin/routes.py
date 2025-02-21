from __future__ import annotations
from flask import jsonify, request
from app.admin import bp
from app.models import *
from flask_login import current_user, login_required

@login_required
@bp.route("/", methods=["GET"])
def is_admin():
    user = current_user._get_current_object()

    print(user)

    return jsonify(user.to_json()), 200 # type: ignore

@login_required
@bp.route("/users/", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([user.to_json() for user in users])

@login_required
@bp.route("/makeAdmin/", methods=["POST"])
def make_admin():
    data = request.get_json()
    userId = data.get("id")
    isAdmin = data.get("isAdmin")
    print("Received data - ID: " + str(userId))
    print("Received data - Admin: " + str(isAdmin))
    user = User.query.filter_by(id=userId).first()
    user.is_admin = isAdmin # type: ignore
    try:
        db.session.commit()
        return jsonify({"message": "User admin status updated"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating admin status: {e}")
        return jsonify({"message": "Error: Could not update user"}), 500
    
@login_required
@bp.route("/ban/", methods=["POST"])
def ban_user():
    data = request.get_json()
    userId = data.get("id")
    isBanned = data.get("ban")
    print("Received data - ID: " + str(userId))
    print("Received data - banned: " + str(isBanned))
    user = User.query.filter_by(id=userId).first()
    user.is_banned = isBanned # type: ignore

    if isBanned:
        days = data.get("days")
        print("Received data - days: " + str(days))
        # TODO: Finish this method once banning functionality is working properly

    try:
        db.session.commit()
        return jsonify({"message": "User ban status updated"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating ban status: {e}")
        return jsonify({"message": "Error: Could not update user's ban status"})
    
@bp.route("/delete/<int:id>", methods = ["POST"])
def delete_recipe(id):
    recipe = Recipe.query.filter_by(id = id).first()
    if(recipe is not None):
        try:
            db.session.delete(recipe)
            db.session.commit()
            return jsonify({"message": "Recipe deleted successfully"}), 200
        except Exception as e:
            db.session.rollback() 
            return jsonify({"message": "Error; Could not delete recipe", "error": str(e)}), 500
    return jsonify({"message": "Error; Could not delete recipe"}), 500
