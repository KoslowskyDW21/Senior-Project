from __future__ import annotations

from flask_login import login_required, current_user
from app.challenges import bp
from app.models import User, Challenge, db
from flask import request, jsonify, abort, current_app
from datetime import datetime, timedelta, UTC
from werkzeug.utils import secure_filename
import os
import pytz

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@login_required
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

    # Save to the database
    db.session.add(challenge)
    db.session.commit()

    return jsonify({"message": "Challenge created successfully!"}), 200
