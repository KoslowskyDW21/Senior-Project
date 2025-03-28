from __future__ import annotations
from flask import jsonify, redirect, url_for, current_app, request
from flask_login import current_user, login_required
from app.profile import bp
from app.models import User, UserAchievement, Achievement, UserReport, db, UserBlock
from sqlalchemy import or_, and_
from werkzeug.utils import secure_filename
import uuid
import os

@bp.route('/<int:id>/', methods=['POST'])
def post_profile_page(id=1):
    print("searching for user " + str(id))
    print(current_user)
    ua = UserAchievement.query.filter_by(user_id = current_user.id).all()
    achievements = []
    for a in ua:
        achievements.append(Achievement.query.filter_by(id = a.achievement_id).first())
        

    if current_user is not None:
        return jsonify({ "lname": current_user.lname,
                         "fname": current_user.fname,
                         "username": current_user.username,
                         "achievements": [achievement.to_json() for achievement in achievements],
                         "user_level": current_user.user_level,
                         "xp_points": current_user.xp_points,
                         "hasLeveled": current_user.hasLeveled
                         }), 200
    return "<h1>404: profile not found</h1>", 404

@bp.route('/get_other_profile/<int:id>/', methods=['GET'])
def get_other_profile(id):
    user_data = (
        db.session.query(
            User.id,
            User.lname,
            User.fname,
            User.username,
            User.profile_picture,
            User.user_level,
            User.xp_points,
            Achievement.id.label("achievement_id"),
            Achievement.image.label("achievement_image"),
            Achievement.title.label("achievement_title"),  
            Achievement.isVisible.label("achievement_isVisible"),
            Achievement.description.label("achievement_description")
        )
        .outerjoin(UserAchievement, User.id == UserAchievement.user_id)
        .outerjoin(Achievement, UserAchievement.achievement_id == Achievement.id)
        .filter(User.id == id)
        .all()
    )

    if not user_data:
        return "<h1>404: profile not found</h1>", 404
    
    profile_picture = None
    if user_data[0].profile_picture:
        profile_picture = f'{user_data[0].profile_picture}'
        print("profile picture" + profile_picture)

    user_info = {
        "lname": user_data[0].lname,
        "fname": user_data[0].fname,
        "username": user_data[0].username,
        "profile_picture": profile_picture,
        "user_level": user_data[0].user_level,
        "xp_points": user_data[0].xp_points,
        "achievements": []
    }

    for row in user_data:
        if row.achievement_id:  
            user_info["achievements"].append({
                "id": row.achievement_id,
                "image": row.achievement_image,
                "title": row.achievement_title,
                "isVisible": row.achievement_isVisible,
                "description": row.achievement_description
            })

    return jsonify(user_info), 200


@bp.route('/block_user/<int:id>/', methods=['POST'])
def block_user(id):
    new_block = UserBlock(blocked_user=id, blocked_by=current_user.id)
    db.session.add(new_block)
    
    try:
        db.session.commit()
        
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error blocking user {id}: {e}")
        return jsonify({"error": "Error blocking user"}), 500
    return {"message": "User blocked successfully"}, 200

@bp.route('/unblock_user/<int:id>/', methods=['POST'])
def unblock_user(id):
    db.session.query(UserBlock).filter(and_(UserBlock.blocked_user==id, UserBlock.blocked_by==current_user.id)).delete()
    
    try:
        db.session.commit()
        
    except IntegrityError as e:
        db.session.rollback()
        print(f"Error unblocking user {id}: {e}")
        return jsonify({"error": "Error unblocking user"}), 500
    return {"message": "User unblocked successfully"}, 200

#This tells the backend whether or not the profile being displayed is a blocked user
@bp.route('/is_blocked/<int:id>/', methods=['POST'])
def is_blocked(id):
    is_blocked = db.session.query(UserBlock).filter(and_(UserBlock.blocked_user==id, UserBlock.blocked_by==current_user.id)).first()
    return jsonify({"is_blocked": bool(is_blocked)}), 200

@bp.route('/is_current_user_blocked/<int:id>/', methods=['POST'])
def is_current_user_blocked(id):
    is_current_user_blocked = db.session.query(UserBlock).filter(and_(UserBlock.blocked_user==current_user.id, UserBlock.blocked_by==id)).first()
    return jsonify({"is_current_user_blocked": bool(is_current_user_blocked)}), 200

@bp.route('/current_user/', methods=['POST'])
def post_current_user():
    if(current_user is not None):
        return jsonify(
            current_user.to_json() # type: ignore
        ), 200
    return "<h1>404: profile not found</h1>", 404

@bp.route('/get_profile_pic/', methods=['POST'])
def get_profile_pic():
    print("Static folder:", current_app.static_folder)
    user = db.session.query(User).filter(User.id == current_user.id).first()
    if user and user.profile_picture:
        print(user.profile_picture)
        profile_picture = f'{user.profile_picture}'
        print(jsonify({"profile_picture": profile_picture}))
        return jsonify({
            "profile_picture": profile_picture
        }), 200
    return jsonify({"message": "No profile picture found"}), 200

#File storage:
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS    

@bp.route('/change_profile_pic/', methods=['POST'])
def change_profile_pic():
    profile_picture = request.files.get('profile_picture')
    user = db.session.query(User).filter(User.id == current_user.id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    if profile_picture and allowed_file(profile_picture.filename):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)

        if user.profile_picture:
            old_file_path = os.path.join(current_app.root_path, user.profile_picture)
            if os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                except OSError as e:
                    current_app.logger.error(f"Error deleting old profile picture: {e}")

        insecureFilename = profile_picture.filename
        if not insecureFilename:
            return jsonify({"message": "Invalid file name"}), 400
        filename = f"{uuid.uuid4().hex}_{secure_filename(insecureFilename)}"
        file_path = os.path.join(upload_folder, filename)
        profile_picture.save(file_path)

        relative_path = os.path.join('static', 'uploads', filename)
        user.profile_picture = relative_path
        profile_picture_url = relative_path
        db.session.commit()
    else:
        profile_picture_url = None
        return jsonify({"message": "Invalid file"}), 400
    
    return jsonify({
        "message": "Change successful",
        "profile_picture_url": profile_picture_url
    }), 200

@bp.route('/remove_profile_pic/', methods=['POST'])
def remove_profile_pic():
    user = db.session.query(User).filter(User.id == current_user.id).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    if user.profile_picture:
            old_file_path = os.path.join(current_app.root_path, user.profile_picture)
            if os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                except OSError as e:
                    current_app.logger.error(f"Error deleting old profile picture: {e}")
            user.profile_picture = None
            db.session.commit()
    return {"message": "Profile picture removed successfully"}, 200

@bp.route('/leveled/', methods=['POST'])
def leveled():
    current_user.hasLeveled = 0
    db.session.add(current_user)
    db.session.commit()
    return {"message": "Level trigger updated successfully!"}, 200

@login_required
@bp.route("/report/", methods=["POST"])
def report():
    user = current_user._get_current_object()
    data = request.get_json()
    reportedId = data.get("report_id")

    print("Received data - reportedId: " + str(reportedId))

    report = UserReport.query.filter_by(reported_by=user.id, reported_user=reportedId).first() # type: ignore

    print(report)

    if report != None:
        return jsonify({"message": "You already reported this user"}), 405

    newReport: UserReport = UserReport(reported_user=reportedId, reported_by=user.id, reason="N/A") # type: ignore
    otherUser: User = User.query.filter_by(id=reportedId).first() # type: ignore
    otherUser.num_reports += 1

    try:
        db.session.add(newReport)
        db.session.commit()
        return jsonify({"message": f"User {reportedId} reported"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error reporting user: {e}")
        return jsonify({"message": "Error: could not report user"}), 500