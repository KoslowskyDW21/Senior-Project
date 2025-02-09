from __future__ import annotations

from flask_login import login_required, current_user
from app.challenges import bp
from app.models import User, Challenge, ChallengeParticipant, ChallengeVote, db
from flask import request, jsonify, abort, current_app
from datetime import datetime, timedelta, UTC
from werkzeug.utils import secure_filename
import os
import pytz

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@login_required
@bp.route('/', methods=['GET', 'POST'])
def challenges():
    """
    challenge = Challenge(
        name = "Charlie's Chili Challenge",
        creator = 1,
        difficulty = '1',
        theme = "Chili",
        location = "Main Lobby",
        start_time = datetime.now(UTC),
        end_time = datetime.now(UTC) + timedelta(hours=3),
        is_complete = False,
        num_reports = 0
    )
    db.session.add(challenge)
    db.session.commit()
    """
    
    challenges = Challenge.query.all()
    return jsonify([challenge.to_json() for challenge in challenges]), 200

@login_required
@bp.route('/<int:id>', methods=['GET'])
def get_challenge(id):
    challenge = Challenge.query.get(id)
    print(id)
    print(challenge)
    if not challenge:
        abort(404, description="Challenge not found")
    return jsonify(challenge.to_json()), 200

@bp.route('/create', methods=['POST'])
@login_required
def create_challenge():
    name = request.form.get('name')
    difficulty = request.form.get('difficulty')
    theme = request.form.get('theme')
    location = request.form.get('location')
    start_time = request.form.get('start_time')
    end_time = request.form.get('end_time')
    image = request.files.get('image')

    # Validate required fields
    if not all([name, difficulty, theme, location, start_time, end_time]):
        return jsonify({"message": "All fields are required"}), 400

    # Parse and validate datetime fields
    try:
        start_time_dt = datetime.fromisoformat(start_time)
        end_time_dt = datetime.fromisoformat(end_time)

        if start_time_dt.tzinfo is None:
            start_time_dt = pytz.utc.localize(start_time_dt)
        if end_time_dt.tzinfo is None:
            end_time_dt = pytz.utc.localize(end_time_dt)
    except ValueError:
        return jsonify({"message": "Invalid date format"}), 400

    # Check if start time is before end time
    if start_time_dt >= end_time_dt:
        return jsonify({"message": "Start time must be before end time"}), 400

    # Check if the time difference is not more than 24 hours
    if end_time_dt - start_time_dt > timedelta(hours=24):
        return jsonify({"message": "Start time and end time cannot be more than 24 hours apart"}), 400

    # Check if start time is at least 24 hours from now
    if start_time_dt < datetime.now(UTC) + timedelta(hours=24):
        return jsonify({"message": "Start time must be at least 24 hours later than the current time"}), 400

    # Validate difficulty
    try:
        difficulty_int = int(difficulty)
        if not (1 <= difficulty_int <= 5):
            return jsonify({"message": "Difficulty must be between 1 and 5"}), 400
    except ValueError:
        return jsonify({"message": "Difficulty must be an integer between 1 and 5"}), 400

    # Create the challenge instance
    challenge = Challenge(
        name=name,
        creator=current_user.id,
        difficulty=difficulty,
        theme=theme,
        location=location,
        start_time=start_time_dt,
        end_time=end_time_dt,
        is_complete=False,
        num_reports=0,
    )

    # Handle image upload
    if image and allowed_file(image.filename):
        try:
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            filename = secure_filename(image.filename)
            file_path = os.path.join(upload_folder, filename)
            image.save(file_path)
            challenge.image = os.path.join('static', 'uploads', filename)
        except Exception as e:
            return jsonify({"message": f"File upload failed: {str(e)}"}), 500
    else:
        challenge.image = "static/uploads/default_image.jpg"

    # Save to the database
    db.session.add(challenge)
    db.session.commit()

    return jsonify({"message": "Challenge created successfully!",
                    "challenge_id": challenge.id}), 200

@bp.route('/current_user_id/', methods=['GET', 'POST'])
def post_current_user():
    return jsonify(
        current_user.id
    ), 200

@bp.route('/<int:challenge_id>/join', methods=['POST'])
@login_required
def join_challenge(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        abort(404, description="Challenge not found")

    participant = ChallengeParticipant(challenge_id=challenge_id, user_id=current_user.id)
    db.session.add(participant)
    db.session.commit()

    return jsonify({"message": "Joined challenge successfully!"}), 200

@bp.route('/<int:challenge_id>/leave', methods=['POST'])
@login_required
def leave_challenge(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        abort(404, description="Challenge not found")

    participant = ChallengeParticipant.query.filter_by(challenge_id=challenge_id, user_id=current_user.id).first()
    if participant:
        db.session.delete(participant)
        db.session.commit()

    return jsonify({"message": "Left challenge successfully!"}), 200

@bp.route('/<int:challenge_id>/participants', methods=['GET'])
@login_required
def get_participants(challenge_id):
    participants = ChallengeParticipant.query.filter_by(challenge_id=challenge_id).all()
    participant_data = []
    for participant in participants:
        user = User.query.get(participant.user_id)
        participant_data.append({"user_id": user.id, "username": user.username})
    return jsonify(participant_data), 200

@bp.route('/<int:challenge_id>/is_participant', methods=['GET'])
@login_required
def is_participant(challenge_id):
    participant = ChallengeParticipant.query.filter_by(challenge_id=challenge_id, user_id=current_user.id).first()
    return jsonify({"is_participant": participant is not None}), 200

@bp.route('/<int:challenge_id>/delete', methods=['DELETE'])
@login_required
def delete_challenge(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        abort(404, description="Challenge not found")

    if challenge.creator != current_user.id:
        abort(403, description="You do not have permission to delete this challenge")

    # Delete associated participants
    ChallengeParticipant.query.filter_by(challenge_id=challenge_id).delete()

    # Delete the challenge
    db.session.delete(challenge)
    db.session.commit()

    return jsonify({"message": "Challenge deleted successfully!"}), 200

@bp.route('/<int:challenge_id>/vote', methods=['POST'])
@login_required
def submit_vote(challenge_id):
    data = request.get_json()
    voter_id = data.get('voter_id')
    votee_id = data.get('votee_id')

    if voter_id == votee_id:
        return jsonify({"message": "You cannot vote for yourself"}), 400

    # Check if the voter is a participant of the challenge
    participant = ChallengeParticipant.query.filter_by(challenge_id=challenge_id, user_id=voter_id).first()
    if not participant:
        return jsonify({"message": "You must be a participant to vote"}), 403

    # Check if the votee is a participant of the challenge
    votee = ChallengeParticipant.query.filter_by(challenge_id=challenge_id, user_id=votee_id).first()
    if not votee:
        return jsonify({"message": "The selected user is not a participant"}), 400

    # Check if the user has already voted
    existing_vote = ChallengeVote.query.filter_by(challenge_id=challenge_id, given_by=voter_id).first()
    if existing_vote:
        # Update the existing vote
        existing_vote.given_to = votee_id
    else:
        # Create a new vote
        vote = ChallengeVote(challenge_id=challenge_id, given_by=voter_id, given_to=votee_id)
        db.session.add(vote)

    db.session.commit()

    return jsonify({"message": "Vote submitted successfully"}), 201

