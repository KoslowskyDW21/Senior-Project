from __future__ import annotations
from flask import jsonify, request
from app.admin import bp
from app.models import *
from flask_login import current_user, login_required

@login_required
@bp.route("/", methods=["GET"])
def is_admin():
    user = current_user._get_current_object()
    return jsonify(user.to_json()), 200 # type: ignore
    return jsonify({"isAdmin": user.is_admin}), 200 # type: ignore