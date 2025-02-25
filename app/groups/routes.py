from __future__ import annotations
from app.groups import bp
from app.models import User, UserGroup, GroupMember, GroupBannedMember, Message, GroupReport, UserNotifications, MessageReport, db
from flask import jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS    

@bp.route('/<int:id>', methods=['GET', 'POST'])
@login_required
def get_group(id):
    group = UserGroup.query.get(id)
    if not group:
        return jsonify({"message": "Group not found"}), 404
    return jsonify(group.to_json()), 200

@bp.route('/', methods=['GET'])
def get_groups():
    groups = UserGroup.query.filter_by(is_public=True).all()
    return jsonify([group.to_json() for group in groups]), 200

@bp.route('/reported/', methods=["GET"])
@login_required
def get_reported_groups():
    reportedGroups = UserGroup.query.filter(UserGroup.num_reports > 0).all()
    return jsonify([group.to_json() for group in reportedGroups]), 200

@bp.route("/reports/<int:id>/", methods=["GET"])
@login_required
def get_reports(id):
    print(id)
    reports = GroupReport.query.filter_by(group_id=id).all()
    print(reports)
    return jsonify([report.to_json() for report in reports]), 200

@bp.route('/<int:group_id>/join', methods=['POST'])
@login_required
def join_group(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    member = GroupMember(group_id=group_id, member_id=current_user.id, is_trusted=False)
    db.session.add(member)
    db.session.commit()

    # Create a message indicating the user has joined the group
    message = Message(
        group_id=group_id,
        user_id=current_user.id,
        text=f"{current_user.username} has joined the group.",
        is_reported=False
    )
    db.session.add(message)
    db.session.commit()

    return jsonify({"message": "Joined group successfully!"}), 200

@bp.route('/<int:group_id>/leave', methods=['POST'])
@login_required
def leave_group(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    member = GroupMember.query.filter_by(group_id=group_id, member_id=current_user.id).first()
    if member:
        db.session.delete(member)
        db.session.commit()

        # Create a message indicating the user has left the group
        message = Message(
            group_id=group_id,
            user_id=current_user.id,
            text=f"{current_user.username} has left the group.",
            is_reported=False
        )
        db.session.add(message)
        db.session.commit()

    return jsonify({"message": "Left group successfully!"}), 200

@bp.route('/<int:group_id>/is_member', methods=['GET'])
@login_required
def is_member(group_id):
    member = GroupMember.query.filter_by(group_id=group_id, member_id=current_user.id).first()
    return jsonify({"is_member": member is not None}), 200

@bp.route('/<int:group_id>/members', methods=['GET'])
@login_required
def get_members(group_id):
    members = GroupMember.query.filter_by(group_id=group_id).all()
    member_data = []
    for member in members:
        user = User.query.get(member.member_id)
        profile_picture_url = f'/static/uploads/{user.profile_picture}' if user.profile_picture else None
        member_data.append({
            "user_id": user.id,
            "username": user.username,
            "profile_picture": profile_picture_url,
            "is_trusted": member.is_trusted
        })
    return jsonify(member_data), 200

@bp.route('/my_groups', methods=['GET'])
@login_required
def get_my_groups():
    group_memberships = GroupMember.query.filter_by(member_id=current_user.id).all()
    group_ids = [membership.group_id for membership in group_memberships]
    groups = UserGroup.query.filter(UserGroup.id.in_(group_ids)).all()
    return jsonify([group.to_json() for group in groups]), 200

@bp.route('/create', methods=['POST'])
@login_required
def create_group():
    name = request.form.get('name')
    description = request.form.get('description')
    is_public = request.form.get('is_public') == 'true'
    image = request.files.get('image')

    if not name or not description:
        return jsonify({"message": "Name and description are required"}), 400

    group = UserGroup(
        name=name,
        description=description,
        is_public=is_public,
        creator=current_user.id,
        num_reports=0
    )

    if image and allowed_file(image.filename):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        filename = f"{uuid.uuid4().hex}_{secure_filename(image.filename)}"
        file_path = os.path.join(upload_folder, filename)
        image.save(file_path)
        group.image = os.path.join('static', 'uploads', filename)
    else:
        group.image = "static/uploads/default_image.jpg"

    db.session.add(group)
    db.session.commit()

    member = GroupMember(group_id=group.id, member_id=current_user.id, is_trusted=True)
    db.session.add(member)
    db.session.commit()

    return jsonify({"message": "Group created successfully!", "group_id": group.id}), 200

@bp.route('/<int:group_id>/messages', methods=['GET'])
@login_required
def get_messages(group_id):
    messages = Message.query.filter_by(group_id=group_id).order_by(Message.id.asc()).all()
    message_data = []
    for message in messages:
        user = User.query.get(message.user_id)
        message_data.append({
            "id": message.id,
            "user_id": message.user_id,
            "username": user.username,
            "text": message.text
        })
    return jsonify(message_data), 200

@bp.route('/<int:group_id>/messages', methods=['POST'])
@login_required
def send_message(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    text = request.json.get('text')
    if not text:
        return jsonify({"message": "Message text is required"}), 400

    message = Message(group_id=group_id, user_id=current_user.id, text=text, is_reported=False)
    db.session.add(message)
    db.session.commit()

    return jsonify({"message": "Message sent successfully!"}), 200

@login_required
@bp.get("/<int:group_id>/reportGroup")
def get_report_group(group_id: int):
    user = current_user._get_current_object()

    report = GroupReport.query.filter_by(user_id=user.id, group_id=group_id).first() # type: ignore
        
    if report != None:
        return jsonify({"alreadyReported": True, "id": user.id}) # type: ignore
    
    return jsonify({"alreadyReported": False, "id": user.id}) # type: ignore

@login_required
@bp.post("/<int:group_id>/reportGroup")
def post_report_group(group_id: int):
    data = request.get_json()
    userId = data.get("user_id")
    groupId = data.get("group_id")

    print("Received data - userID: " + str(userId))
    print("Received data - groupID: " + str(groupId))

    newReport: GroupReport = GroupReport(group_id=groupId, user_id=userId, reason="N/A") # type: ignore
    group: UserGroup = UserGroup.query.filter_by(id=groupId).first() # type: ignore
    group.num_reports += 1

    try:
        db.session.add(newReport)
        db.session.commit()
        return jsonify({"message": f"Group {groupId} reported"})
    except Exception as e:
        db.session.rollback()
        print(f"Error reporting group: {e}")
        return jsonify({"message": "Error: could not report group"})
    
@login_required
@bp.get("/<int:message_id>/reportMessage")
def get_report_message(message_id: int):
    user = current_user._get_current_object()

    report = MessageReport.query.filter_by(user_id=user.id, message_id=message_id).first() # type: ignore
        
    if report != None:
        return jsonify({"alreadyReported": True, "id": user.id}) # type: ignore
    
    return jsonify({"alreadyReported": False, "id": user.id}) # type: ignore

@login_required
@bp.post("/<int:message_id>/reportMessage")
def post_report_message(message_id: int):
    data = request.get_json()
    userId = data.get("user_id")
    messageId = data.get("message_id")

    print("Received data - userID: " + str(userId))
    print("Received data - messageId: " + str(messageId))

    newReport: MessageReport = MessageReport(message_id=messageId, user_id=userId, reason="N/A") # type: ignore
    message: Message = Message.query.filter_by(id=messageId).first() # type: ignore
    message.num_reports += 1

    try:
        db.session.add(newReport)
        db.session.commit()
        return jsonify({"message": f"Message {messageId} reported"})
    except Exception as e:
        db.session.rollback()
        print(f"Error reporting message: {e}")
        return jsonify({"message": "Error: could not report message"})


@bp.route('/<int:group_id>/set_trusted', methods=['POST'])
@login_required
def set_trusted(group_id):
    user_id = request.json.get('user_id')
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    if group.creator != current_user.id and not GroupMember.query.filter_by(group_id=group_id, member_id=current_user.id, is_trusted=True).first():
        return jsonify({"message": "Permission denied"}), 403

    member = GroupMember.query.filter_by(group_id=group_id, member_id=user_id).first()
    if member:
        member.is_trusted = True
        db.session.commit()
        print(f"Set {user_id} as trusted in group {group_id}")
        return jsonify({"message": "Member set as trusted successfully!"}), 200
    else:
        return jsonify({"message": "Member not found"}), 404
    
@bp.route('/<int:group_id>/revoke_trusted', methods=['POST'])
@login_required
def revoke_trusted(group_id):
    user_id = request.json.get('user_id')
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    if group.creator != current_user.id:
        return jsonify({"message": "Permission denied"}), 403

    member = GroupMember.query.filter_by(group_id=group_id, member_id=user_id).first()
    if member:
        member.is_trusted = False
        db.session.commit()
        return jsonify({"message": "Member's trusted status revoked successfully!"}), 200
    else:
        return jsonify({"message": "Member not found"}), 404
    

@bp.route("/<int:group_id>/delete_reports", methods=["DELETE"])
@login_required
def delete_reports(group_id: int):
    reports = GroupReport.query.filter_by(group_id=group_id).all()

    for report in reports:
        db.session.delete(report)
    
    db.session.commit()
    return jsonify({"message": "Reports succesfully deleted"}), 200

@bp.route('/<int:group_id>/delete', methods=['DELETE'])
@login_required
def delete_group(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    if (group.creator != current_user.id) and (not current_user.is_admin):
        return jsonify({"message": "Permission denied"}), 403

    Message.query.filter_by(group_id=group_id).delete()
    GroupBannedMember.query.filter_by(group_id=group_id).delete()
    GroupMember.query.filter_by(group_id=group_id).delete()
    db.session.delete(group)
    db.session.commit()

    return jsonify({"message": "Group deleted successfully!"}), 200


@bp.route('/<int:group_id>/invite', methods=['GET', 'POST'])
@login_required
def invite_friends(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    if group.creator != current_user.id and not GroupMember.query.filter_by(group_id=group_id, member_id=current_user.id, is_trusted=True).first():
        return jsonify({"message": "Permission denied"}), 403

    friend_ids = request.json.get('friend_ids', [])
    for friend_id in friend_ids:
        notification = UserNotifications(
            user_id=friend_id,
            notification_text=f"You have been invited to join the group {group.name}.",
            notification_type='group_message',
            group_id=group_id
        )
        db.session.add(notification)
    db.session.commit()

    return jsonify({"message": "Invitations sent successfully!"}), 200

@bp.route('/<int:group_id>/invite_response', methods=['POST'])
@login_required
def invite_response(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    response = request.json.get('response')
    if response == 'accept':
        member = GroupMember(group_id=group_id, member_id=current_user.id, is_trusted=False)
        db.session.add(member)
        db.session.commit()
        return jsonify({"message": "You have joined the group!"}), 200
    elif response == 'deny':
        return jsonify({"message": "You have denied the invitation."}), 200
    else:
        return jsonify({"message": "Invalid response."}), 400
    

@bp.route('/<int:group_id>/kick', methods=['POST'])
@login_required
def kick_user_from_group(group_id):
    data = request.get_json()
    user_id_to_kick = data.get('user_id')

    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    if group.creator != current_user.id:
        return jsonify({"message": "Permission denied"}), 403

    participant = GroupMember.query.filter_by(group_id=group_id, member_id=user_id_to_kick).first()
    if not participant:
        return jsonify({"message": "User not found in group"}), 404

    db.session.delete(participant)
    db.session.commit()

    return jsonify({"message": "User kicked successfully!"}), 200