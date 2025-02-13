from __future__ import annotations
from flask import jsonify, request
from app.friends import bp
from app.models import *
from flask_login import current_user, login_required

@bp.route('/get_friends/', methods=['POST'])
def get_friends():
    friends = db.session.query(
        Friendship,
        User.id,
        User.username,  
        User.email_address,
        User.profile_picture
    ).join(
        User, (Friendship.user1 == User.id) | (Friendship.user2 == User.id)
    ).filter(
        (Friendship.user1 == current_user.id) | (Friendship.user2 == current_user.id)
    ).all()

    friends_list = []
    for friendship, user_id, username, email_address, profile_picture in friends:
        if user_id != current_user.id:  
            friends_list.append({
                "id": user_id,
                "username": username,
                "email_address": email_address,
                "profile_picture": profile_picture
            })

    return jsonify({
        "friends": friends_list
    }), 200

@bp.route('/add_friend/', methods=['POST'])
def add_friend():
    pass#

#TODO: maybe add table: friend_request?