from __future__ import annotations
from app.challenges import bp
from app.models import User, Challenge, db
from flask import request, jsonify


#default route just for the time being
@bp.route('/', methods=['POST'])
def home():
    return jsonify({"message": "This is the challenges page!"}), 200