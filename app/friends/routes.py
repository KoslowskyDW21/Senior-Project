from __future__ import annotations
from flask import jsonify, request
from sqlalchemy import or_
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

@bp.route('/search_for_friends/', methods=['POST'])
def search_for_friends():
    search_query = request.json.get('search_query', '').strip()

    if not search_query:
        return jsonify({"users": []}), 200

    users = db.session.query(User).filter(
        or_(
            User.username.ilike(f'%{search_query}%'),
            User.fname.ilike(f'%{search_query}%'),
            User.lname.ilike(f'%{search_query}%')
        )
    ).all()

    users_list = [
        {
            "id": user.id,
            "username": user.username,
            "fname": user.fname,
            "lname": user.lname,
            "profile_picture": user.profile_picture
        }
        for user in users if user.id != current_user.id
    ]

    return jsonify({"users": users_list}), 200

@bp.route('/get_requests_to/', methods=['POST'])
def get_requests_to():
    friend_requests_to = db.session.query(
        FriendRequest,
        User.id,
        User.username,
        User.profile_picture
    ).join(
        User, (FriendRequest.requestTo == User.id)
    ).filter(
        (FriendRequest.requestFrom == current_user.id)
    ).all()

    users_list = [
        {
            'requestFrom': fr.requestFrom,
            'requestTo': fr.requestTo,
            'id': user_id,
            'username': username,
            'profile_picture': profile_picture
        }
        for fr, user_id, username, profile_picture in friend_requests_to
    ]
    return jsonify({"friend_requests_to": users_list}), 200

@bp.route('/get_requests_from/', methods=['POST'])
def get_requests_from():
    friend_requests_from = db.session.query(
        FriendRequest,
        User.id,
        User.username,
        User.profile_picture
    ).join(
        User, (FriendRequest.requestFrom == User.id)
    ).filter(
        (FriendRequest.requestTo == current_user.id)
    ).all()

    users_list = [
        {
            'requestFrom': fr.requestFrom,
            'requestTo': fr.requestTo,
            'id': user_id,
            'username': username,
            'profile_picture': profile_picture
        }
        for fr, user_id, username, profile_picture in friend_requests_from
    ]
    return jsonify({"friend_requests_from": users_list}), 200

@bp.route('/send_request/', methods=['POST'])
def send_request():
    pass#

@bp.route('/accept_request/', methods=['POST'])
def accept_request():
    pass#

