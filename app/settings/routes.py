from __future__ import annotations
from flask import jsonify
from app.settings import bp
from app.models import User, UserBlock, Friendship, UserDietaryRestriction, \
    UserCuisinePreference, GroupMember, GroupBannedMember, CookedRecipe, \
    Review, UserAchievement, UserGroup, Message, db
from flask_login import current_user, login_required


@login_required
@bp.route('/', methods=['POST'])
def post_settings_page():
    print("Current User:", current_user)
    user = current_user
    return jsonify(user.to_json()), 200


def delete_user_and_dependencies(session, current_user_id):
    try:
        session.query(UserBlock).filter(
            (UserBlock.blocking_user_id == current_user_id) | (UserBlock.blocked_user_id == current_user_id)
        ).delete(synchronize_session=False)
        
        session.query(Friendship).filter(
            (Friendship.user_id == current_user_id) | (Friendship.friend_id == current_user_id)
        ).delete(synchronize_session=False)
        
        session.query(UserDietaryRestriction).filter(
            UserDietaryRestriction.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(UserCuisinePreference).filter(
            UserCuisinePreference.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(GroupMember).filter(
            GroupMember.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(GroupBannedMember).filter(
            GroupBannedMember.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(CookedRecipe).filter(
            CookedRecipe.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(Review).filter(
            Review.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(UserAchievement).filter(
            UserAchievement.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(UserGroup).filter(
            UserGroup.user_id == current_user_id
        ).delete(synchronize_session=False)
        
        session.query(Message).filter(
            Message.sender_id == current_user_id
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
@bp.route('/api/delete_account', methods=['POST'])
def delete_account():
    user = current_user
    session = db.session
    current_user_id = user.id
    delete_user_and_dependencies(session, current_user_id)
    return {"message": "Account deleted successfully"}, 204