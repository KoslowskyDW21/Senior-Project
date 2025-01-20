from __future__ import annotations
from app.achievements import bp
from app.models import User, Achievement, db
from flask import request, jsonify, abort
from datetime import datetime, timedelta

@bp.route('/', methods=['POST'])
def achievements():
    achievements = Achievement.query.all()
    return jsonify([achievement.to_json() for achievement in achievements]), 200 

@bp.route('/<int:id>', methods=['GET'])
def get_achievement(id):
    achievement = Achievement.query.get(id)
    if not achievement:
        abort(404, description="Achievement not found")
    return jsonify(achievement.to_json()), 200

@bp.route('/create', methods=['POST'])
def create_achievement():
    return jsonify({"message": "Achievement created successfully!"}), 200

