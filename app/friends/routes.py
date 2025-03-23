from __future__ import annotations
from flask import jsonify, request
from sqlalchemy import or_, and_
from sqlalchemy.exc import IntegrityError
from app.friends import bp
from app.models import *
from flask_login import current_user, login_required
import random
from enum import Enum

class notificationType(Enum):
    send_request = 1
    accept_request = 2


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

import random
from sqlalchemy.orm import aliased

@bp.route('/get_suggested_friends/', methods=['POST'])
def get_suggested_friends():
    F1 = aliased(Friendship)
    F2 = aliased(Friendship)

    friend_ids = db.session.query(F1.user2).filter(F1.user1 == current_user_id).union(
        db.session.query(F2.user1).filter(F2.user2 == current_user_id)
    ).subquery()

    suggested_friends = db.session.query(
        User.id,
        User.username,
        User.email_address,
        User.profile_picture
    ).filter(
        User.colonial_floor == current_user.colonial_floor,
        User.colonial_side == current_user.colonial_side,
        User.id != current_user_id, 
        ~User.id.in_(friend_ids) 
    ).all()

    suggested_friends_list = [
        {
            "id": user_id,
            "username": username,
            "email_address": email_address,
            "profile_picture": profile_picture
        }
        for user_id, username, email_address, profile_picture in suggested_friends
    ]

    # randomizing order
    random.shuffle(suggested_friends_list)

    return jsonify({
        "suggested_friends": suggested_friends_list
    }), 200  

@bp.route('/search_for_friends/', methods=['POST'])
def search_for_friends():
    json = request.json
    if not json:
        return jsonify({"error": "Invalid request"}), 400
    search_query = json.get('search_query', '').strip()

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

def request_notification(requestFrom, requestTo, requestType):
    notification_message = "if you see this, something has gone drastically wrong"

    userFrom = User.query.filter_by(id=requestFrom).first()
    userTo = User.query.filter_by(id=requestTo).first()

    if not userFrom or not userTo:
        return jsonify({"error": "Invalid user IDs"}), 400

    match requestType: 
        case notificationType.send_request:
            notification_message = f"You have a new friend request from {userFrom.username}."
            print("new request: ")
            print(notification_message)
        case notificationType.accept_request:
            notification_message = f"{userTo.username} has accepted your friend request."
            print("accept message: ")
            print(notification_message)
        case _:
            print("If you see this, you've done something drastically wrong")
    
    notification_user_id = -1
    if requestType == notificationType.send_request:
        notification_user_id = requestTo
    else:
        notification_user_id = requestFrom

    friend_notification = UserNotifications(user_id = notification_user_id, notification_text = notification_message, isRead = False, notification_type = 'friend_request') #type: ignore
    db.session.add(friend_notification)
    print(friend_notification)
    try:
        db.session.commit()
        return jsonify({"message": "Notification sent successfully"}), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"error": "sending notification"}), 500
        print(f"Error sending notification to  {notification_user_id}: {e}")
        return jsonify({"error": "sending notification"}), 500

def delete_notification(requestFrom, requestTo):
    user = db.session.query(User).filter(User.id == requestFrom).first()
    if not user:
        return jsonify({"error": "Invalid user ID"}), 400
    notification_text_pattern = f"You have a new friend request from {user.username}%"
    notification_to_delete = db.session.query(UserNotifications).filter(
        and_(
            UserNotifications.notification_text.like(notification_text_pattern),
            UserNotifications.user_id == requestTo
        )
    ).all()

    if notification_to_delete:
        for notification in notification_to_delete:
            db.session.delete(notification)
        
        try:
            db.session.commit()
            print(f"Deleted notification for user {requestTo}")
        except IntegrityError as e:
            db.session.rollback()
            print(f"Error deleting notification for user {requestTo}: {e}")
            return jsonify({"error": "Error deleting notification"}), 500
    else:
        print(f"No matching notifications found for user {requestTo}.")
    

@bp.route('/send_request/<int:id>', methods=['POST'])
def send_request(id):
    new_request = FriendRequest(requestFrom=current_user.id, requestTo=id) #type: ignore
    request_notification(current_user.id, id, notificationType.send_request)
    db.session.add(new_request)
    try:
        db.session.commit()
        

    except IntegrityError as e:
        db.session.rollback()
        print(f"Error sending friend request to {id}: {e}")
        return jsonify({"error": "Error sending friend request"}), 500
    return {"message": "friend request sent successfully"}, 200
    

@bp.route('/accept_request/<int:id>', methods=['POST'])
def accept_request(id):
    request = db.session.query(FriendRequest).filter(and_(FriendRequest.requestFrom==id, FriendRequest.requestTo==current_user.id)).first()
    if request:
        #Create new friendship, delete request, 
        new_friendship = Friendship(user1 = request.requestFrom, user2 = request.requestTo) #type: ignore
        db.session.query(FriendRequest).filter(and_(FriendRequest.requestFrom==id, FriendRequest.requestTo==current_user.id)).delete()
        db.session.add(new_friendship)
        checkAchievement(request.requestFrom, request.requestTo)

    else:
        print("No request, heathen!")
    
    try:
        db.session.commit()
        request_notification(id, current_user.id, notificationType.accept_request)
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error accepting friend request from {id}: {e}")
        return jsonify({"error": "Error accepting friend request"}), 500
    return {"message": "friend request accepted successfully"}, 200

@bp.route('/revoke_request/<int:id>', methods=['POST'])
def revoke_request(id): 
    request = db.session.query(FriendRequest).filter(and_(FriendRequest.requestFrom==current_user.id, FriendRequest.requestTo==id)).first()
    if request:
        delete_notification(request.requestFrom, request.requestTo)
    db.session.query(FriendRequest).filter(and_(FriendRequest.requestFrom==current_user.id, FriendRequest.requestTo==id)).delete()
    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error revoking friend request to {id}: {e}")
        return jsonify({"error": "Error revoking friend request"}), 500
    return {"message": "friend request revoked successfully"}, 200

@bp.route('/remove_friend/<int:id>', methods=['POST'])
def remove_friend(id):
    db.session.query(Friendship).filter(
        or_(
            and_(Friendship.user1 == id, Friendship.user2 == current_user.id),
            and_(Friendship.user2 == id, Friendship.user1 == current_user.id)
        )
    ).delete()

    try:
        db.session.commit()
        return jsonify({"message": "Friendship removed successfully"}), 200

    except IntegrityError as e:
        db.session.rollback()
        print(f"Error removing friendship with user {id}: {e}")
        return jsonify({"error": "Could not remove friendship"}), 500

@bp.route('/decline_request/<int:id>', methods=['POST'])
def decline_request(id):
    request = db.session.query(FriendRequest).filter(and_(FriendRequest.requestFrom==id, FriendRequest.requestTo==current_user.id)).first()
    if request:
        delete_notification(request.requestFrom, request.requestTo)
        db.session.query(FriendRequest).filter(and_(FriendRequest.requestFrom==id, FriendRequest.requestTo==current_user.id)).delete()
    else:
        print("No request, heathen!")
    

    try:
        db.session.commit()
        return jsonify({"message": "Request declined successfully"}), 200

    except IntegrityError as e:
        db.session.rollback()
        print(f"Error declining request with user {id}: {e}")
        return jsonify({"error": "Could not decline request"}), 500
    
def checkAchievement(user1, user2):
    if(UserAchievement.query.filter_by(achievement_id = 4, user_id = user1).all() == None): # type: ignore
        a1 = UserAchievement(achievement_id = 4, user_id = user1) #type: ignore
        db.session.add(a1)
        db.session.flush()
        db.session.commit()
        

    if(UserAchievement.query.filter_by(achievement_id = 4, user_id = user2).all() == None): # type: ignore
        a2 = UserAchievement(achievement_id = 4, user_id = user2) #type: ignore
        db.session.add(a2)
        db.session.flush()
        db.session.commit()
    
    

