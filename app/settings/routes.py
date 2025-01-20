from __future__ import annotations
from flask import jsonify
from app.settings import bp
from app.models import User, db
from flask_login import current_user

@bp.route('/', methods=['POST'])
def post_settings_page():
    user = current_user

    return jsonify({
        "id": user.id,
        "fname": user.fname,
        "lname": user.lname,
        "profile_picutre": user.profile_picture,
        "colonial_floor": user.colonial_floor,
        "colonial_side": user.colonial_side
    })