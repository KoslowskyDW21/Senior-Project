from __future__ import annotations
from flask import jsonify
from app.profile import bp
from app.models import User, db

@bp.route('/<int:id>', methods=['POST'])
def post_profile_page(id):
    print("searching for user " + str(id))
    user = User.query.filter_by(id=id).first()
    if user is not None:
        return jsonify({"id": str(user.id)}), 200 # TODO: refactor to return more than just an id
    return "<h1>404: profile not found</h1>", 404

@bp.route('/', methods=['POST'])
def post_default_profile_page():
    print("Getting default user profile")
    user = User.query.filter_by(id=1).first()
    if user is not None:
        return jsonify({"id": "1"}), 200
    return "<h1>Something is wrong in the database: user 1 does not exist</h1>"