from __future__ import annotations
from flask import render_template
from app.profile import bp
from app.models import User, db

@bp.get("/<int:id>/")
def get_profile_page(id):
    print("searching for user " + str(id))
    user = User.query.filter_by(id=id).first()
    if user is not None:
        return render_template('profile.html', user=user)
    return "<h1>404: profile not found</h1>", 404