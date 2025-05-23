from __future__ import annotations
from flask import jsonify, request
from app.admin import bp
from app.models import *
from flask_login import current_user, login_required
from datetime import datetime, timedelta, UTC, timezone

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
@bp.get("/reports/<int:id>")
def get_reports(id):
    reports: list[UserReport] = UserReport.query.filter(UserReport.reported_user == id).all()
    return jsonify([report.to_json() for report in reports]), 200

@login_required
@bp.delete("/reports/<int:id>/delete_reports")
def delete_reports(id):
    reports: list[UserReport] = UserReport.query.filter(UserReport.reported_user == id).all()
    
    for report in reports:
        db.session.delete(report)

    db.session.commit()
    return jsonify({"message": "Reports successfully deleted"}), 200

@login_required
@bp.post("/reports/<int:id>/set_reports_zero")
def set_reports_zero(id):
    user: User = User.query.get(id) # type: ignore
    user.num_reports = 0

    db.session.commit()
    return jsonify({"message": "Dismissed reports successfully"}), 200

@login_required
@bp.get("/ban/")
def get_ban_status():
    # Handle GET request
    user = current_user._get_current_object()  # Get the current user
    if not user:
        return jsonify({"message": "User not found"}), 404
    is_banned = user.is_banned  # Check if the user is banned
    return jsonify({"banned": is_banned}), 200


@login_required
@bp.post("/ban/")
def ban_user():
    # Handle POST request
    data = request.get_json()
    if not data:
        return jsonify({"message": "Invalid request. No data provided"}), 400

    userId = data.get("id")
    isBanned = data.get("ban")
    print("Received data - ID: " + str(userId))
    print("Received data - banned: " + str(isBanned))
    user: User = User.query.filter_by(id=userId).first() # type: ignore
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.is_banned = isBanned

    if isBanned:
        days = data.get("days")
        print("Received data - days: " + str(days))
        banTime = datetime.now(UTC) + timedelta(days=days)
        user.banned_until = banTime 

        reason = data.get("reason")
        print("Received data - reason: " + str(reason))
        user.reason_for_ban = reason
    else:
        user.banned_until = None 
        user.reason_for_ban = None

    try:
        db.session.commit()
        return jsonify({"message": "User ban status updated"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating ban status: {e}")
        return jsonify({"message": "Error: Could not update user's ban status"}), 500
    
@login_required
@bp.post("/stillBanned")
def still_banned():
    user = current_user._get_current_object()
    now = datetime.now(UTC)
    now = now.replace(tzinfo=None)
    banTime = user.banned_until #type: ignore
    print("Now: " + str(now))
    print("Banned until: " + str(banTime))

    if now > banTime:
        user.is_banned = False # type: ignore
        user.banned_until = None # type: ignore
        user.reason_for_ban = None # type: ignore
    else:
        return jsonify({"message": "User is still banned", "banned": True}), 200

    try:
        db.session.commit()
        return jsonify({"message": "User is no longer banned", "banned": False}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error unbanning user: {e}")
        return jsonify({"message": "Error: Could not unban user", "banned": False}), 500

@login_required
@bp.get("/ban")
def get_ban():
    user: User = current_user._get_current_object() # type: ignore
    print(user)
    isBanned: bool = user.is_banned
    return jsonify({"banned": isBanned})

    
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

@bp.get("/reasons")
def get_reasons():
    user: User = current_user._get_current_object() # type: ignore
    reason: str = user.reason_for_ban
    return jsonify({"reasons": reason})