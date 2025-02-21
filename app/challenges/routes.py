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

def get_localized_time(time):
    if type(time) is str:
        time = datetime.fromisoformat(time)
    if time.tzinfo is None:
        time = pytz.utc.localize(time)
    return time

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
    duration = request.form.get('duration')
    image = request.files.get('image')

    # Validate required fields
    if not all([name, difficulty, theme, location, start_time, duration]):
        return jsonify({"message": "All fields are required"}), 400

    start_time_dt = get_localized_time(start_time)
    try:
        duration_hours = int(duration)
    except ValueError:
        return jsonify({"message": "Duration must be a valid number"}), 400
    
    if duration_hours > 24:
        return jsonify({"message": "Duration cannot be more than 24 hours"}), 400

    end_time_dt = start_time_dt + timedelta(hours=duration_hours)

    # Check if start time is before end time
    if start_time_dt >= end_time_dt:
        return jsonify({"message": "Start time must be before end time"}), 400

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
        return jsonify({"message": "Challenge not found"}), 404

    if datetime.now(UTC) >= get_localized_time(challenge.start_time):
        return jsonify({"message": "Cannot join challenge after it has started"}), 403

    participant = ChallengeParticipant(challenge_id=challenge_id, user_id=current_user.id)
    db.session.add(participant)
    db.session.commit()

    return jsonify({"message": "Joined challenge successfully!"}), 200

@bp.route('/<int:challenge_id>/leave', methods=['POST'])
@login_required
def leave_challenge(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404

    if datetime.now(UTC) >= get_localized_time(challenge.start_time):
        return jsonify({"message": "Cannot leave challenge after it has started"}), 403

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

    if challenge.creator != current_user.id and not current_user.is_admin:
        abort(403, description="You do not have permission to delete this challenge")

    ChallengeVote.query.filter_by(challenge_id=challenge_id).delete()
    ChallengeParticipant.query.filter_by(challenge_id=challenge_id).delete()
    db.session.delete(challenge)
    db.session.commit()

    return jsonify({"message": "Challenge deleted successfully!"}), 200

@bp.route('/<int:challenge_id>/vote', methods=['POST'])
@login_required
def submit_vote(challenge_id):
    data = request.get_json()
    voter_id = data.get('voter_id')
    first_choice = data.get('first_choice')
    second_choice = data.get('second_choice')
    third_choice = data.get('third_choice')

    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404

    now = datetime.now(UTC)
    start_time = get_localized_time(challenge.start_time)
    end_time = get_localized_time(challenge.end_time)
    voting_end_time = end_time + timedelta(hours=24)

    if not (start_time <= now <= voting_end_time):
        return jsonify({"message": "Voting is not allowed at this time"}), 403

    if voter_id in [first_choice, second_choice, third_choice]:
        return jsonify({"message": "You cannot vote for yourself"}), 400

    if len({first_choice} - {None}) < 1:
        return jsonify({"message": "You must select a vote for the first place winner"}), 400

    participant = ChallengeParticipant.query.filter_by(challenge_id=challenge_id, user_id=voter_id).first()
    if not participant:
        return jsonify({"message": "You must be a participant to vote"}), 403

    existing_vote = ChallengeVote.query.filter_by(challenge_id=challenge_id, given_by=voter_id).first()
    if existing_vote:
        existing_vote.first_choice = first_choice
        existing_vote.second_choice = second_choice
        existing_vote.third_choice = third_choice
    else:
        vote = ChallengeVote(
            challenge_id=challenge_id,
            given_by=voter_id,
            first_choice=first_choice,
            second_choice=second_choice,
            third_choice=third_choice,
        )
        db.session.add(vote)

    db.session.commit()

    return jsonify({"message": "Vote submitted successfully"}), 201

@bp.route('/<int:challenge_id>/vote_results', methods=['GET'])
@login_required
def get_vote_results(challenge_id):
    votes = ChallengeVote.query.filter_by(challenge_id=challenge_id).all()
    participants = {participant.user_id: 0 for participant in ChallengeParticipant.query.filter_by(challenge_id=challenge_id).all()}

    for vote in votes:
        if vote.first_choice:
            participants[vote.first_choice] = participants.get(vote.first_choice, 0) + 5
        if vote.second_choice:
            participants[vote.second_choice] = participants.get(vote.second_choice, 0) + 3
        if vote.third_choice:
            participants[vote.third_choice] = participants.get(vote.third_choice, 0) + 1

    results = []
    for user_id, points in participants.items():
        user = User.query.get(user_id)
        results.append({
            "user_id": user_id,
            "username": user.username,
            "points": points
        })

    results.sort(key=lambda x: x['points'], reverse=True)
    return jsonify(results), 200

@bp.route('/past_user_participated_challenges', methods=['GET'])
@login_required
def get_past_user_challenges():
    now = datetime.now(UTC)
    past_challenges = Challenge.query.filter(
        Challenge.end_time < now - timedelta(hours=24)
    ).all()

    user_participated_challenges = [
        challenge for challenge in past_challenges
        if ChallengeParticipant.query.filter_by(challenge_id=challenge.id, user_id=current_user.id).first()
    ]

    return jsonify([challenge.to_json() for challenge in user_participated_challenges]), 200

@bp.route('/past_challenges', methods=['GET'])
@login_required
def get_past_challenges():
    now = datetime.now(UTC)
    past_challenges = Challenge.query.filter(
        Challenge.end_time < now - timedelta(hours=24)
    ).all()

    return jsonify([challenge.to_json() for challenge in past_challenges]), 200