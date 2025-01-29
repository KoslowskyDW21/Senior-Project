from __future__ import annotations
from flask import jsonify, redirect, url_for, current_app, request
from flask_login import current_user
from app.profile import bp
from app.models import User, UserAchievement, Achievement, db
from werkzeug.utils import secure_filename
import uuid
import os

@bp.route('/<int:id>', methods=['POST'])
def post_profile_page(id=1):
    print("searching for user " + str(id))
    print(current_user)
    ua = UserAchievement.query.filter_by(user_id = id)
    achievements = []
    for a in ua:
        achievements.append(Achievement.query.filter_by(id = a.user_id).first())

    if current_user is not None:
        return jsonify({ "lname": current_user.lname,
                         "fname": current_user.fname,
                         "username": current_user.username,
                         "achievements": [achievement.to_json() for achievement in achievements],
                         "user_level": current_user.user_level,
                         "xp_points": current_user.xp_points
                         }), 200
    return "<h1>404: profile not found</h1>", 404

@bp.route('/current_user', methods=['GET', 'POST'])
def post_current_user():
    return jsonify(
        current_user._get_current_object().to_json()
    ), 200

@bp.route('/get_profile_pic/', methods=['POST'])
def get_profile_pic():
    print("Static folder:", current_app.static_folder)
    user = db.session.query(User).filter(User.id == current_user.id).first()
    if user and user.profile_picture:
        print(user.profile_picture)
        profilePicturePath = f'http://127.0.0.1:5000/{user.profile_picture}'
        print(jsonify({"profile_picture": profilePicturePath}))
        return jsonify({
            "profile_picture": profilePicturePath
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

        filename = f"{uuid.uuid4().hex}_{secure_filename(profile_picture.filename)}"
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

