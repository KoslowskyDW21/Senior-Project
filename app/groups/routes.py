from __future__ import annotations
from app.groups import bp
from app.models import User, UserGroup, GroupMember, GroupBannedMember, Message, GroupReport, UserNotifications, MessageReport, UserBlock, db
from flask import jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS    

@bp.route('/<int:id>/', methods=['GET', 'POST'])
@login_required
def get_group(id):
    group = UserGroup.query.get(id)
    if not group:
        return jsonify({"message": "Group not found"}), 404
    
    # Check if the group is public or if the user is a member or invited
    if not group.is_public:
        is_member = GroupMember.query.filter_by(group_id=id, member_id=current_user.id).first()
        is_invited = UserNotifications.query.filter_by(
            group_id=id,
            user_id=current_user.id,  # type: ignore
            notification_type='group_message'
        ).first()

        if not is_member and not is_invited:
            return jsonify({"message": "You are not allowed to view this group"}), 403


    return jsonify(group.to_json()), 200

@bp.route('/', methods=['GET'])
@login_required
def get_all_groups():
    user: User = current_user._get_current_object()  # type: ignore

    # Initialize the response structure
    response_data = {
        "my_groups": [],
        "invited_groups": [],
        "all_groups": [],
        "total_pages": 1,
        "current_page": 1,
    }

    # Get the page, per_page, and search query parameters from the request (default to page 1, per_page 10, and empty search)
    page = max(1, int(request.args.get('page', 1)))  # Ensure page is at least 1
    per_page = int(request.args.get('per_page', 10))  # Default to 10 groups per page
    search_query = request.args.get('search', "").strip().lower()  # Get the search query (empty string if not provided)

    # 1. Fetch all public groups (with pagination and search filter if query is present)
    public_groups_query = UserGroup.query.filter_by(is_public=True)

    # If there is a search query, filter public groups by name (case insensitive)
    if search_query:
        public_groups_query = public_groups_query.filter(UserGroup.name.ilike(f"%{search_query}%"))

    # Fetch the filtered public groups (no pagination yet)
    public_groups_filtered = public_groups_query.all()

    # 2. Fetch the private groups the user is part of (with pagination and search filter if query is present)
    my_group_ids = {membership.group_id for membership in GroupMember.query.filter_by(member_id=user.id).all()}
    private_groups_query = UserGroup.query.filter(
        UserGroup.id.in_(my_group_ids),
        UserGroup.is_public == False
    )

    # If there is a search query, filter private groups by name (case insensitive)
    if search_query:
        private_groups_query = private_groups_query.filter(UserGroup.name.ilike(f"%{search_query}%"))

    # Fetch the filtered private groups (no pagination yet)
    private_groups_filtered = private_groups_query.all()

    # Combine public and private groups
    all_groups_filtered = public_groups_filtered + private_groups_filtered

    # Get the total number of pages based on the filtered result
    total_groups_count = len(all_groups_filtered)
    total_pages_all = (total_groups_count // per_page) + (1 if total_groups_count % per_page else 0)

    # For My Groups (the groups the user is a member of), apply search query if present
    if search_query:
        my_groups_query = UserGroup.query.filter(
            UserGroup.id.in_(my_group_ids),
            UserGroup.name.ilike(f"%{search_query}%")
        )
    else:
        my_groups_query = UserGroup.query.filter(UserGroup.id.in_(my_group_ids))

    my_groups = my_groups_query.all()
    response_data['my_groups'] = [group.to_json() for group in my_groups]

    # 3. Get invited groups (groups the user has been invited to)
    notifications = UserNotifications.query.filter_by(user_id=user.id, notification_type='group_message').all()
    invited_group_ids = {notification.group_id for notification in notifications}
    response_data['invited_groups'] = [
        group.to_json() for group in all_groups_filtered if group.id in invited_group_ids
    ]

    # 4. Paginate the combined filtered groups for the "all_groups" section
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_groups = all_groups_filtered[start_idx:end_idx]

    response_data['all_groups'] = [group.to_json() for group in paginated_groups]

    # Pagination data
    response_data['total_pages'] = total_pages_all
    response_data['current_page'] = page

    return jsonify(response_data), 200


@bp.route('/my_groups/', methods=['GET'])
@login_required
def get_my_groups():
    group_memberships = GroupMember.query.filter_by(member_id=current_user.id).all()
    group_ids = [membership.group_id for membership in group_memberships]
    groups = UserGroup.query.filter(UserGroup.id.in_(group_ids)).all()
    return jsonify([group.to_json() for group in groups]), 200

@bp.route('/notifications/', methods=['GET'])
@login_required
def get_notifications():
    notifications = UserNotifications.query.filter_by(
            user_id=current_user.id,  # type: ignore
            notification_type='group_message'
        )
    
    invited_groups = []
    for notification in notifications:
        group = UserGroup.query.get(notification.group_id)
        if group:
            invited_groups.append(group.to_json())

    return jsonify({
        "invited_groups": invited_groups
    }), 200

@bp.route('/reported/', methods=["GET"])
@login_required
def get_reported_groups():
    reportedGroups: list[UserGroup] = UserGroup.query.filter(UserGroup.num_reports > 0).all()
    return jsonify([group.to_json() for group in reportedGroups]), 200

@bp.route("/reported_messages/", methods=["GET"])
@login_required
def get_reported_messages():
    reportedMessages = Message.query.filter(Message.num_reports > 0).all()

    message_data = []
    for message in reportedMessages:
        user = User.query.get(message.user_id)
        if(not user):
            continue
        message_data.append({
            "id": message.id,
            "user_id": message.user_id,
            "username": user.username,
            "text": message.text,
            "num_reports": message.num_reports
        })
    return jsonify(message_data), 200

@bp.route("/reports/<int:id>/", methods=["GET"])
@login_required
def get_reports(id):
    print(id)
    reports = GroupReport.query.filter_by(group_id=id).all()
    print(reports)
    return jsonify([report.to_json() for report in reports]), 200

@bp.route("/message_reports/<int:id>/", methods=["GET"])
@login_required
def get_message_reports(id):
    print(id)
    reports = MessageReport.query.filter_by(message_id=id).all()
    print(reports)
    return jsonify([report.to_json() for report in reports]), 200

@bp.route('/<int:group_id>/join/', methods=['POST'])
@login_required
def join_group(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    member = GroupMember(group_id=group_id, member_id=current_user.id, is_trusted=False) #type: ignore
    db.session.add(member)
    db.session.commit()

    # Create a message indicating the user has joined the group
    message = Message(
        group_id=group_id, #type: ignore
        user_id=current_user.id, #type: ignore
        text=f"{current_user.username} has joined the group.", #type: ignore
        num_reports=-1 #type: ignore
    )
    db.session.add(message)
    db.session.commit()

    return jsonify({"message": "Joined group successfully!"}), 200

@bp.route('/<int:group_id>/leave/', methods=['POST'])
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
            group_id=group_id, #type: ignore
            user_id=current_user.id, #type: ignore
            text=f"{current_user.username} has left the group.", #type: ignore
            num_reports=-1 #type: ignore
        )
        db.session.add(message)
        db.session.commit()

    return jsonify({"message": "Left group successfully!"}), 200

@bp.route('/<int:group_id>/is_member/', methods=['GET'])
@login_required
def is_member(group_id):
    member = GroupMember.query.filter_by(group_id=group_id, member_id=current_user.id).first()
    return jsonify({"is_member": member is not None}), 200

@bp.route('/<int:group_id>/members/', methods=['GET'])
@login_required
def get_members(group_id):
    members = GroupMember.query.filter_by(group_id=group_id).all()
    member_data = []
    for member in members:
        user = User.query.get(member.member_id)
        if(not user):
            continue
        profile_picture_url = f'/static/uploads/{user.profile_picture}' if user.profile_picture else None
        member_data.append({
            "user_id": user.id,
            "username": user.username,
            "profile_picture": profile_picture_url,
            "is_trusted": member.is_trusted
        })
    return jsonify(member_data), 200


@bp.route('/create/', methods=['POST'])
@login_required
def create_group():
    name = request.form.get('name')
    description = request.form.get('description')
    is_public = request.form.get('is_public') == 'true'
    image = request.files.get('image')

    if not name or not description:
        return jsonify({"message": "Name and description are required"}), 400

    group = UserGroup(
        name=name, #type: ignore
        description=description, #type: ignore
        is_public=is_public, #type: ignore
        creator=current_user.id, #type: ignore
        num_reports=0 #type: ignore
    )

    if image and allowed_file(image.filename):
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        insecureFilename = image.filename
        if not insecureFilename:
            return jsonify({"message": "Invalid file name"}), 400
        filename = f"{uuid.uuid4().hex}_{secure_filename(insecureFilename)}"
        file_path = os.path.join(upload_folder, filename)
        image.save(file_path)
        group.image = os.path.join('static', 'uploads', filename)
    else:
        group.image = "static/uploads/default_image.jpg"

    db.session.add(group)
    db.session.commit()

    member = GroupMember(group_id=group.id, member_id=current_user.id, is_trusted=True) #type: ignore
    db.session.add(member)
    db.session.commit()

    return jsonify({"message": "Group created successfully!", "group_id": group.id}), 200

@bp.route('/<int:group_id>/messages/', methods=['GET'])
@login_required
def get_messages(group_id):
    user: User = current_user._get_current_object() # type: ignore
    messages: list[Message] = Message.query.filter_by(group_id=group_id).order_by(Message.id.asc()).all()

    if not user.is_admin:
        reports: list[MessageReport] = MessageReport.query.filter(MessageReport.user_id == user.id).all()
        reportedMessages: list[int] = [report.message_id for report in reports]
        messages = [message for message in messages if not message.id in reportedMessages]
 
    message_data = []
    for message in messages:
        user = User.query.get(message.user_id) # type: ignore
        if(not user):
            continue
        message_data.append({
            "id": message.id,
            "user_id": message.user_id,
            "username": user.username,
            "text": message.text,
            "num_reports": message.num_reports
        })
    return jsonify(message_data), 200

@bp.route('/<int:group_id>/messages/', methods=['POST'])
@login_required
def send_message(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    json = request.json
    if not json:
        return jsonify({"message": "Invalid request"}), 400
    text = json.get('text')
    if not text:
        return jsonify({"message": "Message text is required"}), 400

    message = Message(group_id=group_id, user_id=current_user.id, text=text, num_reports=0) #type: ignore
    db.session.add(message)
    db.session.commit()

    return jsonify({"message": "Message sent successfully!"}), 200

@login_required
@bp.get("/<int:group_id>/reportGroup/")
def get_report_group(group_id: int):
    user = current_user._get_current_object()

    report = GroupReport.query.filter_by(user_id=user.id, group_id=group_id).first() # type: ignore
        
    if report != None:
        return jsonify({"alreadyReported": True, "id": user.id}) # type: ignore
    
    return jsonify({"alreadyReported": False, "id": user.id}) # type: ignore

@login_required
@bp.post("/<int:group_id>/reportGroup/")
def post_report_group(group_id: int):
    data = request.get_json()
    userId = data.get("user_id")
    groupId = data.get("group_id")
    reason = data.get("reason")

    print("Received data - userID: " + str(userId))
    print("Received data - groupID: " + str(groupId))
    print("Received data - reason: " + str(reason))

    newReport: GroupReport = GroupReport(group_id=groupId, user_id=userId, reason=reason) # type: ignore
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
@bp.get("/<int:message_id>/reportMessage/")
def get_report_message(message_id: int):
    user = current_user._get_current_object()

    report = MessageReport.query.filter_by(user_id=user.id, message_id=message_id).first() # type: ignore
        
    if report != None:
        return jsonify({"alreadyReported": True, "id": user.id}) # type: ignore
    
    return jsonify({"alreadyReported": False, "id": user.id}) # type: ignore

@login_required
@bp.post("/<int:message_id>/reportMessage/")
def post_report_message(message_id: int):
    data: dict = request.get_json()
    userId = data.get("user_id")
    messageId = data.get("message_id")
    reason = data.get("reason")

    print("Received data - userID: " + str(userId))
    print("Received data - messageId: " + str(messageId))
    print("Received data - reason: " + str(reason))

    newReport: MessageReport = MessageReport(message_id=messageId, user_id=userId, reason=reason) # type: ignore
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


@bp.route('/<int:group_id>/set_trusted/', methods=['POST'])
@login_required
def set_trusted(group_id):
    json = request.json
    if not json:
        return jsonify({"message": "Invalid request"}), 400
    user_id = json.get('user_id')
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
    
@bp.route('/<int:group_id>/revoke_trusted/', methods=['POST'])
@login_required
def revoke_trusted(group_id):
    json = request.json
    if not json:
        return jsonify({"message": "Invalid request"}), 400
    user_id = json.get('user_id')
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
    
@login_required
@bp.route("/<int:message_id>/delete_message_reports/", methods=["DELETE"])
def delete_message_reports(message_id: int):
    reports = MessageReport.query.filter_by(message_id=message_id).all()

    for report in reports:
        db.session.delete(report)
    
    db.session.commit()
    return jsonify({"message": "Reports successfully deleted"}), 200

@login_required
@bp.route("/<int:message_id>/set_message_reports_zero/", methods=["POST"])
def set_message_reports_zero(message_id: int):
    message: Message = Message.query.get(message_id) # type: ignore
    message.num_reports = 0

    db.session.commit()
    return jsonify({"message": "Dismissed reports successfully"}), 200

@login_required
@bp.route("/<int:message_id>/delete_message/", methods=["DELETE"])
def delete_message(message_id: int):
    message = Message.query.get(message_id)

    if not message:
        return jsonify({"message": "Message not found"}), 404
    
    db.session.delete(message)
    db.session.commit()

    return jsonify({"message": "Message deleted succesffully!"}), 200

@bp.route("/<int:group_id>/delete_reports/", methods=["DELETE"])
@login_required
def delete_reports(group_id: int):
    reports = GroupReport.query.filter_by(group_id=group_id).all()

    for report in reports:
        db.session.delete(report)
    
    db.session.commit()
    return jsonify({"message": "Reports succesfully deleted"}), 200

@bp.route("/<int:group_id>/set_group_reports_zero/", methods=["POST"])
@login_required
def set_group_reports_zero(group_id: int):
    group: UserGroup = UserGroup.query.get(group_id) # type: ignore
    group.num_reports = 0

    db.session.commit()
    return jsonify({"message": "Dismissed reports successfully"}), 200

@bp.route('/<int:group_id>/delete/', methods=['DELETE'])
@login_required
def delete_group(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    if (group.creator != current_user.id) and (not current_user.is_admin):
        return jsonify({"message": "Permission denied"}), 403

    messages = Message.query.filter_by(group_id=group_id)
    for message in messages:
        MessageReport.query.filter_by(message_id=message.id).delete()
    messages.delete()
    GroupBannedMember.query.filter_by(group_id=group_id).delete()
    GroupMember.query.filter_by(group_id=group_id).delete()
    GroupReport.query.filter_by(group_id=group_id).delete()
    UserNotifications.query.filter_by(group_id=group_id).delete()
    db.session.delete(group)
    db.session.commit()

    return jsonify({"message": "Group deleted successfully!"}), 200


@bp.route('/<int:group_id>/invite/', methods=['GET', 'POST'])
@login_required
def invite_friends(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    if group.creator != current_user.id and not GroupMember.query.filter_by(group_id=group_id, member_id=current_user.id, is_trusted=True).first():
        return jsonify({"message": "Permission denied"}), 403

    json = request.json
    if not json:
        return jsonify({"message": "Invalid request"}), 400
    friend_ids = json.get('friend_ids', [])
    for friend_id in friend_ids:
        notification = UserNotifications(
            user_id=friend_id, #type: ignore
            notification_text=f"You have been invited to join the group {group.name}.", #type: ignore
            notification_type='group_message', #type: ignore
            group_id=group_id #type: ignore
        )
        db.session.add(notification)
    db.session.commit()

    return jsonify({"message": "Invitations sent successfully!"}), 200

@bp.route('/<int:group_id>/invite_response/', methods=['POST'])
@login_required
def invite_response(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404
    
    UserNotifications.query.filter_by(
        user_id=current_user.id,  # type: ignore
        group_id=group_id,
        notification_type='group_message'
    ).delete()
    db.session.commit()

    json = request.json
    if not json:
        return jsonify({"message": "Invalid request"}), 400
    response = json.get('response')
    if response == 'accept':
        member = GroupMember(group_id=group_id, member_id=current_user.id, is_trusted=False) #type: ignore
        db.session.add(member)
        db.session.commit()
        return jsonify({"message": "You have joined the group!"}), 200
    elif response == 'deny':
        return jsonify({"message": "You have denied the invitation."}), 200
    else:
        return jsonify({"message": "Invalid response."}), 400
    

@bp.route('/<int:group_id>/kick/', methods=['POST'])
@login_required
def kick_user_from_group(group_id):
    data = request.get_json()
    user_id_to_kick = data.get('user_id')

    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    if (not (group.creator == current_user.id)) and (not GroupMember.query.filter_by(group_id=group_id, member_id=current_user.id, is_trusted=True).first()):
        return jsonify({"message": "Permission denied"}), 403

    participant = GroupMember.query.filter_by(group_id=group_id, member_id=user_id_to_kick).first()
    if not participant:
        return jsonify({"message": "User not found in group"}), 404

    db.session.delete(participant)
    db.session.commit()

    return jsonify({"message": "User kicked successfully!"}), 200


@bp.route('/<int:group_id>/unviewed_invites/', methods=['GET'])
@login_required
def get_unviewed_invites(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    unviewed_invites = UserNotifications.query.filter_by(
        group_id=group_id,
        notification_type='group_message',
        isRead=False
    ).all()

    # Format the response
    invites_data = []

    for invite in unviewed_invites:
        invites_data.append({"user_id": invite.user_id})

    return jsonify(invites_data), 200


@bp.route('/<int:group_id>/invite_status/', methods=['GET'])
@login_required
def get_invite_status(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    # Check if there is an unviewed invite for the current user
    invite = UserNotifications.query.filter_by(
        group_id=group_id,
        user_id=current_user.id,  # type: ignore
        notification_type='group_message',
    ).first()

    if invite:
        return jsonify({"isInvited": True, "notificationText": invite.notification_text}), 200

    return jsonify({"isInvited": False}), 200
