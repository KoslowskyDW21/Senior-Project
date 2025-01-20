from __future__ import annotations
from flask import jsonify
from app.settings import bp
from app.models import User, db

@bp.route('/', methods=['POST'])
def post_settings_page():
    return "<h1>Settings not found</h1>"