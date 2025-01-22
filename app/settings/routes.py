from __future__ import annotations
from flask import jsonify
from app.settings import bp
from app.models import User, db
from flask_login import current_user, login_required

@login_required
@bp.route('/', methods=['POST'])
def post_settings_page():
    print("Current User:")
    print(current_user)
    user = current_user

    return jsonify(user.to_json()), 200