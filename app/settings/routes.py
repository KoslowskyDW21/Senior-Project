from __future__ import annotations
from flask import jsonify, request
from app.settings import bp
from app.models import *
from flask_login import current_user, login_required


@login_required
@bp.route('/', methods=['POST'])
def post_settings_page():
    print("Current User:")
    print(current_user)
    user = current_user._get_current_object()

    #dietaryRestictions = UserDietaryRestriction.query.filter(UserDietaryRestriction.user_id == user.id).all()

    

    return jsonify(user.to_json()), 200 # type: ignore

@login_required
@bp.route("/update/", methods=['POST'])
def post_update_user():
    user = User.from_json(request.json)
    db.session.add(user)
    db.session.commit()

    return ""


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