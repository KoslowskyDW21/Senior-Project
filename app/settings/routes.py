from __future__ import annotations
from flask import jsonify
from app.settings import bp
from app.models import User, db

@bp.route('/', methods=['POST'])
def post_settings_page():
    return jsonify({
        "id": 0,
        "fname": "Jeff",
        "lname": "Krug",
        "profile_picutre": "null",
        "colonial_floor": "1",
        "colonial_side": "men's"
    })