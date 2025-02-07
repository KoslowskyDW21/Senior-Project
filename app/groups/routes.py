from __future__ import annotations
from app.groups import bp
from app.models import User, UserGroup, GroupMember, GroupBannedMember, Message, db
from flask import jsonify, request
from flask_login import login_required, current_user

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

@bp.route('/<int:group_id>/join', methods=['POST'])
@login_required
def join_group(group_id):
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"message": "Group not found"}), 404

    member = GroupMember(group_id=group_id, member_id=current_user.id)
    db.session.add(member)
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
        member_data.append({"user_id": user.id, "username": user.username})
    return jsonify(member_data), 200