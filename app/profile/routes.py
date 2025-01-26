from __future__ import annotations
from flask import jsonify, redirect, url_for
from flask_login import current_user
from app.profile import bp
from app.models import User, UserAchievement, Achievement, db

@bp.route('/<int:id>', methods=['POST'])
def post_profile_page(id=1):
    print("searching for user " + str(id))
    print(current_user)
    user = User.query.filter_by(id=id).first()
    ua = UserAchievement.query.filter_by(user_id = id)
    achievements = []
    for a in ua:
        achievements.append(Achievement.query.filter_by(id = a.user_id).first())

    if user is not None:
        return jsonify({ "lname": user.lname,
                         "fname": user.fname,
                         "username": user.username,
                         "achievements": [achievement.to_json() for achievement in achievements]
                         }), 200
    return "<h1>404: profile not found</h1>", 404

@bp.route('/current_user', methods=['POST'])
def post_current_user():
    return jsonify({
        current_user.to_json()
    }), 200
