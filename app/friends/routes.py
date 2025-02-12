from __future__ import annotations
from flask import jsonify, request
from app.friends import bp
from app.models import *
from flask_login import current_user, login_required

@bp.route('/get_friends/', methods=['POST'])
def get_friends():
    friends = Friendship.query.filter(
        (Friendship.user1 == current_user.id) | (Friendship.user2 == current_user.id)
    ).all()
    print("friends: ")
    print(friends)
    return jsonify({
        "friends": [friend.to_json() for friend in friends]
    }), 200