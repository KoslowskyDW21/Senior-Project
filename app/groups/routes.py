from __future__ import annotations
from app.groups import bp
from app.models import User, UserGroup, GroupMember, GroupBannedMember, Message
from flask import jsonify, request
from flask_login import login_required

@bp.route('/<int:id>', methods=['GET', 'POST'])
@login_required
def get_group(id):
    group = UserGroup.query.get(id)
    if not group:
        return jsonify({"message": "Group not found"}), 404
    return jsonify(group.to_json()), 200

@bp.route('/', methods=['GET'])
def get_groups():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    groups = UserGroup.query.paginate(page=page, per_page=per_page, error_out=False).items
    return jsonify([group.to_json() for group in groups]), 200