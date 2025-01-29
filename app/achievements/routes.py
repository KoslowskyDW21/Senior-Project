from __future__ import annotations
from app.achievements import bp
from app.models import UserAchievement, Achievement, db
from flask import request, jsonify, abort
from datetime import datetime, timedelta
from flask_login import current_user

@bp.route('/', methods=['POST'])
def achievements():
    achievements = Achievement.query.all()
    userAs = UserAchievement.query.filter_by(user_id=current_user.id).all()
    specAchievements = []
    for a in userAs:
        achievement = Achievement.query.get(a.achievement_id) 
        if achievement:
            specAchievements.append(achievement)
    return jsonify({
        "achievements": [achievement.to_json() for achievement in achievements],
        "specAchievements": [achievement.to_json() for achievement in specAchievements]
    }), 200

@bp.route('/<int:id>', methods=['GET'])
def get_achievement(id):
    achievement = Achievement.query.get(id)
    if not achievement:
        abort(404, description="Achievement not found")
    return jsonify(achievement.to_json()), 200

@bp.route('/create', methods=['POST'])
def create_achievement():
    return jsonify({"message": "Achievement created successfully!"}), 200

