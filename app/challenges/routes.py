from __future__ import annotations
from app.challenges import bp
from app.models import User, Challenge, db
from flask import request, jsonify, abort
from datetime import datetime, timedelta

@bp.route('/', methods=['POST'])
def challenges():
    """
    challenge = Challenge(
        name = "Charlie's Chili Challenge",
        creator = 1,
        image = "app\\challenges\\static\\sampleImage.png",
        difficulty = '1',
        theme = "Chili",
        location = "Main Lobby",
        start_time = datetime.now(),
        end_time = datetime.now() + timedelta(hours=3),
        is_complete = False,
        num_reports = 0
    )
    db.session.add(challenge)
    db.session.commit()
    """
    challenges = Challenge.query.all()
    return jsonify([challenge.to_json() for challenge in challenges]), 200

@bp.route('/<int:id>', methods=['GET'])
def get_challenge(id):
    challenge = Challenge.query.get(id)
    print(id)
    print(challenge)
    if not challenge:
        abort(404, description="Challenge not found")
    return jsonify(challenge.to_json()), 200

@bp.route('/create', methods=['POST'])
def create_challenge():
    return jsonify({"message": "Challenge created successfully!"}), 200

