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