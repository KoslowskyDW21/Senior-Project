from __future__ import annotations
from flask import jsonify, redirect, url_for
from app.profile import bp
from app.models import User, db

@bp.route('/<int:id>', methods=['POST'])
def post_profile_page(id=1):
    print("searching for user " + str(id))
    user = User.query.filter_by(id=id).first()
    if user is not None:
        return jsonify({ "lname": user.lname,
                         "fname": user.fname,
                         "username": user.username
                         }), 200
    return "<h1>404: profile not found</h1>", 404

@bp.route('/', methods=['POST'])
def post_default_profile_page():
    return redirect(url_for('post_profile_page'))