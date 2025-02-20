from __future__ import annotations
from flask import jsonify, request
from app.settings import bp
from app.models import *
from flask_login import current_user, login_required


@login_required
@bp.route('/', methods=['GET'])
def post_settings_page():
    print("Current User:")
    print(current_user)
    user = current_user._get_current_object()

    #dietaryRestictions = UserDietaryRestriction.query.filter(UserDietaryRestriction.user_id == user.id).all()

    return jsonify(user.to_json()), 200 # type: ignore

@bp.route("/update_username/", methods=["POST"])
@login_required
def post_update_username():
    data = request.get_json()
    username = str(data.get("username"))

    print("Received data - Username: " + username) 

    if username in [user.username for user in User.query.all()]:
        return jsonify({"message": "Username already taken", "alreadyTaken": True}), 200

    user = current_user._get_current_object()
    user.username = username # type: ignore

    try: 
        db.session.commit()
        return jsonify({"message": "Username updated succesfully", "alreadyTaken": False}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating username: {e}")
        return jsonify({"message": "Error updating username"}), 500

@bp.route("/update/", methods=['POST'])
@login_required  
def post_update_user():
    data = request.get_json()
    newFloor = str(data.get("floor"))
    newSide = str(data.get("side"))
    print("Received data - Floor: " + newFloor)
    print("Received data - Side: " + newSide)
    user = current_user
    print(user)
    user.colonial_floor = newFloor
    user.colonial_side = newSide
    try:
        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        db.session.rollback() 
        print(f"Error updating user: {e}")
        return jsonify({"message": "Error updating user"}), 500

def delete_user_and_dependencies(session, current_user_id):
    try:
        session.query(UserBlock).filter(
            (UserBlock.blocked_user == current_user_id) | (UserBlock.blocked_by == current_user_id)
        ).delete(synchronize_session=False)
        
        session.query(Friendship).filter(
            (Friendship.user1 == current_user_id) | (Friendship.user2 == current_user_id)
        ).delete(synchronize_session=False)
        
        session.query(UserDietaryRestriction).filter(
            UserDietaryRestriction.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(UserCuisinePreference).filter(
            UserCuisinePreference.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(GroupMember).filter(
            GroupMember.member_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(GroupBannedMember).filter(
            GroupBannedMember.banned_member_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(CookedRecipe).filter(
            CookedRecipe.completed_by == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(Review).filter(
            Review.author == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(UserAchievement).filter(
            UserAchievement.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(Message).filter(
            Message.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(User).filter(
            User.id == current_user_id
        ).delete(synchronize_session=False)
        
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error deleting user data: {e}")
        raise


@login_required
@bp.route('/api/delete_account/', methods=['POST'])
def delete_account():
    user = current_user
    session = db.session
    current_user_id = user.id
    delete_user_and_dependencies(session, current_user_id)
    print("Deleted successfully")
    return jsonify({"message": "Account deleted successfully"}), 200

@bp.route('/cuisines/', methods = ['GET'])
def cuisines():
    cuisines = Cuisine.query.all()
    userCuisines = UserCuisinePreference.query.filter_by(user_id = current_user.id).all()
    return jsonify({
        "cuisines": [cuisine.to_json() for cuisine in cuisines],
        "userCuisines": [uc.to_json() for uc in userCuisines],
    }), 200


@bp.route('/update_cuisines/', methods=['POST'])
def update_user_cuisines():
    data = request.get_json()
    user_id = data['user_id']
    selected_cuisines = data['selected_cuisines']

    for cuisine in selected_cuisines:
        entry = UserCuisinePreference.query.filter_by(user_id=current_user.id, cuisine_id=cuisine).first()

        if entry is None:
            e = UserCuisinePreference(user_id=current_user.id, cuisine_id=cuisine, numComplete=0, userSelected=1) #type:ignore
            db.session.add(e)
        else:
            entry.userSelected = 1
            db.session.add(entry)
    all_preferences = UserCuisinePreference.query.filter_by(user_id=current_user.id).all()
    for preference in all_preferences:
        if preference.cuisine_id not in [cuisine for cuisine in selected_cuisines]:
            preference.userSelected = 0
            if preference.numComplete == 0:
                db.session.delete(preference)
            else:
                db.session.add(preference)
    db.session.commit()

    
    return jsonify({"message": "Cuisines updated successfully"})


@bp.route('/dietary_restrictions/', methods = ['POST'])
def dietary_restrictions():
    restrictions = DietaryRestriction.query.all()
    print(restrictions)
    user_restrictions = UserDietaryRestriction.query.filter_by(user_id = current_user.id).all()
    print(user_restrictions)
    return jsonify({
        "dietaryRestrictions": [restriction.to_json() for restriction in restrictions],
        "userDietaryRestrictions": [ur.to_json() for ur in user_restrictions],
    }), 200

@bp.route('/update_dietary_restrictions/', methods=['POST'])
def update_dietary_restrictions():
    data = request.get_json()
    user_id = data['user_id']
    selected_dietary_restrictions = data['selected_dietary_restrictions']
    print("User id:")
    print(user_id)
    print("Selected restrictions:")
    print(selected_dietary_restrictions)

    for dietary_restriction in selected_dietary_restrictions:
        entry = UserDietaryRestriction.query.filter_by(user_id=current_user.id, restriction_id=dietary_restriction).first()

        if entry is None:
            e = UserDietaryRestriction(user_id=current_user.id, restriction_id=dietary_restriction) #type:ignore
            db.session.add(e)

    all_dietary_restrictions = UserDietaryRestriction.query.filter_by(user_id=current_user.id).all()
    for restriction in all_dietary_restrictions:
        if restriction.restriction_id not in [restriction for restriction in selected_dietary_restrictions]:
            db.session.delete(restriction)
    db.session.commit()

    
    return jsonify({"message": "Restrictions updated successfully"})

@bp.route('/get_notifications/', methods=['POST'])
def get_notifications():
    user = current_user
    notifications = UserNotifications.query.filter_by(user_id=user.id).all()
    return jsonify({
        "notifications": [notification.to_json() for notification in notifications]
    }), 200

@bp.route('/read_notification/', methods=['POST'])
def read_notification():
    data = request.get_json()
    id = data['id']
    print(id)
    notification = UserNotifications.query.filter_by(id=id).first()
    print(notification.notification_text)
    notification.isRead = 1
    try:
        db.session.commit()
        if notification.notification_type == 'group_message' and notification.group_id:
            return jsonify({"message": "Notification read successfully", "redirect_url": f"/groups/{notification.group_id}/invite_response"}), 200
        return jsonify({"message": "Notification read successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating notification: {e}")
        return jsonify({"message": "Error updating notification"}), 500


    