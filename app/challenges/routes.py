from __future__ import annotations

from flask_login import login_required, current_user
from app.challenges import bp
from app.models import User, Challenge, ChallengeParticipant, ChallengeVote, UserNotifications, ChallengeReport, db, UserBlock
from flask import request, jsonify, abort, current_app
from datetime import datetime, timedelta, UTC
from werkzeug.utils import secure_filename
import os
import pytz
import uuid
from math import ceil



ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_localized_time(time):
    if type(time) is str:
        time = datetime.fromisoformat(time)
    if time.tzinfo is None:
        time = pytz.utc.localize(time)
    return time

from datetime import datetime
from flask import jsonify, request
from math import ceil
from app.models import Challenge, ChallengeParticipant, ChallengeReport, UserNotifications, UserBlock, User

# Helper function to filter expired challenges
def filter_expired_challenges(challenges):
    now = datetime.now()
    return [challenge for challenge in challenges if challenge.end_time > now]

@bp.route('/', methods=['GET', 'POST'])
def challenges():
    user: User = current_user._get_current_object()  # type: ignore

    # Get search query
    search_query = request.args.get('search', "").lower()

    # Base query for challenges
    challenges_query = Challenge.query

    # Apply search filtering if a search query exists (for all challenges)
    if search_query:
        challenges_query = challenges_query.filter(Challenge.name.ilike(f"%{search_query}%"))

    # Fetch all challenges (no pagination for this one)
    all_challenges = challenges_query.all()

    # Filter out expired challenges
    all_challenges = filter_expired_challenges(all_challenges)

    # Fetch Joined Challenges (Challenges the user is a participant in)
    joined_challenges_query = Challenge.query.join(ChallengeParticipant, ChallengeParticipant.challenge_id == Challenge.id) \
        .filter(ChallengeParticipant.user_id == user.id)

    # Apply search filtering for joined challenges if search query exists
    if search_query:
        joined_challenges_query = joined_challenges_query.filter(Challenge.name.ilike(f"%{search_query}%"))

    # Fetch Invited Challenges from Notifications (no pagination for this one)
    invited_challenges_query = Challenge.query.filter(Challenge.id.in_(
        db.session.query(UserNotifications.challenge_id)
        .filter(UserNotifications.user_id == user.id)
        .filter(UserNotifications.notification_type == 'challenge_reminder')
    ))

    # Apply search filtering for invited challenges if search query exists
    if search_query:
        invited_challenges_query = invited_challenges_query.filter(Challenge.name.ilike(f"%{search_query}%"))

    # Apply the additional filters for non-admin users (reported challenges, blocked users, etc.)
    if not user.is_admin:
        reports = ChallengeReport.query.filter_by(user_id=user.id).all()
        reported_challenges = [report.challenge_id for report in reports]
        all_challenges = [challenge for challenge in all_challenges if challenge.id not in reported_challenges]
        joined_challenges_query = joined_challenges_query.filter(Challenge.id.notin_(reported_challenges))
        invited_challenges_query = invited_challenges_query.filter(Challenge.id.notin_(reported_challenges))

        blocked_users = UserBlock.query.filter_by(blocked_by=user.id).all()
        blocked_user_ids = [blocked_user.blocked_user for blocked_user in blocked_users]
        all_challenges = [challenge for challenge in all_challenges if challenge.creator not in blocked_user_ids]
        joined_challenges_query = joined_challenges_query.filter(Challenge.creator.notin_(blocked_user_ids))
        invited_challenges_query = invited_challenges_query.filter(Challenge.creator.notin_(blocked_user_ids))

    # Filter out expired challenges from the joined and invited challenges as well
    joined_challenges_query = filter_expired_challenges(joined_challenges_query.all())
    invited_challenges_query = filter_expired_challenges(invited_challenges_query.all())

    # Paginate the results for All Challenges only
    page = max(1, int(request.args.get('page', 1)))  
    per_page = int(request.args.get('per_page', 20))

    all_challenges_paginated = Challenge.query.filter(Challenge.id.in_([challenge.id for challenge in all_challenges])) \
        .paginate(page=page, per_page=per_page, error_out=False)

    total_pages_all = ceil(all_challenges_paginated.total / per_page)  # type: ignore # Correct calculation of total pages

    # Get the challenges for Joined and Invited categories (no pagination here)
    joined_challenges = [challenge.to_json() for challenge in joined_challenges_query]
    invited_challenges = [challenge.to_json() for challenge in invited_challenges_query]

    # Convert challenges to JSON format
    all_challenges_json = [challenge.to_json() for challenge in all_challenges_paginated.items]

    return jsonify({
        'all_challenges': {
            'challenges': all_challenges_json,
            'total_pages': total_pages_all,
            'current_page': page
        },
        'joined_challenges': {
            'challenges': joined_challenges,
        },
        'invited_challenges': {
            'challenges': invited_challenges,
        }
    }), 200




@login_required
@bp.route('/<int:id>/', methods=['GET'])
def get_challenge(id):
    challenge = Challenge.query.get(id)
    if not challenge:
        abort(404, description="Challenge not found")
    return jsonify(challenge.to_json()), 200

@bp.route('/create/', methods=['POST'])
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
        if not duration:
            return jsonify({"message": "Duration is required"}), 400
        duration_hours = int(duration)
    except ValueError:
        return jsonify({"message": "Duration must be a valid number"}), 400
    
    if duration_hours > 24:
        return jsonify({"message": "Duration cannot be more than 24 hours"}), 400

    if not type(start_time_dt) is datetime:
        return jsonify({"message": "Start time must be a valid datetime"}), 400
    end_time_dt = start_time_dt + timedelta(hours=duration_hours)

    # Check if start time is before end time
    if start_time_dt >= end_time_dt:
        return jsonify({"message": "Start time must be before end time"}), 400

    # Check if start time is at least 24 hours from now
    if start_time_dt < datetime.now(UTC) + timedelta(hours=24):
        return jsonify({"message": "Start time must be at least 24 hours later than the current time"}), 400

    # Validate difficulty
    try:
        if not difficulty:
            return jsonify({"message": "Difficulty is required"}), 400
        difficulty_int = int(difficulty)
        if not (1 <= difficulty_int <= 5):
            return jsonify({"message": "Difficulty must be between 1 and 5"}), 400
    except ValueError:
        return jsonify({"message": "Difficulty must be an integer between 1 and 5"}), 400

    # Create the challenge instance
    challenge = Challenge(
        name=name, #type: ignore
        creator=current_user.id, #type: ignore
        difficulty=difficulty, #type: ignore
        theme=theme, #type: ignore
        location=location, #type: ignore
        start_time=start_time_dt, #type: ignore
        end_time=end_time_dt, #type: ignore
        is_complete=False, #type: ignore
        num_reports=0, #type: ignore
    )

    # Handle image upload
    if image and allowed_file(image.filename):
        try:
            upload_folder = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_folder, exist_ok=True)
            insecureFilename = image.filename
            if not insecureFilename:
                return jsonify({"message": "Invalid file name"}), 400
            filename = f"{uuid.uuid4().hex}_{secure_filename(insecureFilename)}"
            file_path = os.path.join(upload_folder, filename)
            image.save(file_path)
            challenge.image = os.path.join('static', 'uploads', filename)
        except Exception as e:
            return jsonify({"message": f"File upload failed: {str(e)}"}), 500
    else:
        challenge.image = "static/uploads/default_image.jpg"

    db.session.add(challenge)
    db.session.commit()

    return jsonify({"message": "Competition (challenge) created successfully!",
                    "challenge_id": challenge.id}), 200

@bp.route('/current_user_id/', methods=['GET', 'POST'])
def post_current_user():
    return jsonify(
        current_user.id
    ), 200

@bp.route('/<int:challenge_id>/join/', methods=['POST'])
@login_required
def join_challenge(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404

    if datetime.now(UTC) >= get_localized_time(challenge.start_time):
        return jsonify({"message": "Cannot join challenge after it has started"}), 403

    participant = ChallengeParticipant(challenge_id=challenge_id, user_id=current_user.id) #type: ignore
    db.session.add(participant)
    db.session.commit()

    return jsonify({"message": "Joined challenge successfully!"}), 200

@bp.route('/<int:challenge_id>/leave/', methods=['POST'])
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
@bp.route('/<int:challenge_id>/participants/', methods=['GET'])
@login_required
def get_participants(challenge_id):
    participants = ChallengeParticipant.query.filter_by(challenge_id=challenge_id).all()
    participant_data = []
    for participant in participants:
        user = User.query.get(participant.user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        participant_data.append({"user_id": user.id, "username": user.username})
    return jsonify(participant_data), 200

@bp.route('/<int:challenge_id>/is_participant/', methods=['GET'])
@login_required
def is_participant(challenge_id):
    participant = ChallengeParticipant.query.filter_by(challenge_id=challenge_id, user_id=current_user.id).first()
    return jsonify({"is_participant": participant is not None}), 200

@bp.route('/<int:challenge_id>/delete/', methods=['DELETE'])
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

@bp.route('/<int:challenge_id>/vote/', methods=['POST'])
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
            challenge_id=challenge_id, #type: ignore
            given_by=voter_id, #type: ignore
            first_choice=first_choice, #type: ignore
            second_choice=second_choice, #type: ignore
            third_choice=third_choice, #type: ignore
        )
        db.session.add(vote)

    db.session.commit()

    return jsonify({"message": "Vote submitted successfully"}), 201

@bp.route('/<int:challenge_id>/vote_results/', methods=['GET'])
@login_required
def get_vote_results(challenge_id):
    challenge = Challenge.query.filter_by(id=challenge_id).first()
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404
    
    now = datetime.now(UTC)
    end_time = get_localized_time(challenge.end_time)
    if now < end_time + timedelta(hours=24):
        return jsonify({"message": "Voting results are not yet available"}), 403

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
        if not user:
            return jsonify({"message": "User not found"}), 404
        results.append({
            "user_id": user_id,
            "username": user.username,
            "points": points
        })

    results.sort(key=lambda x: x['points'], reverse=True)
    
    #add xp to users
    if not challenge.xp_awarded:
        for i, result in enumerate(results):
            uid = result["user_id"]
            theUser = User.query.get(uid)
            if i == 0:
                theUser.xp_points = theUser.xp_points + 400 # type: ignore
            elif i == 1:
                theUser.xp_points = theUser.xp_points + 200 # type: ignore
            elif i == 2:
                theUser.xp_points = theUser.xp_points + 100 # type: ignore
            else:
                theUser.xp_points = theUser.xp_points + 50 # type: ignore
            challenge.xp_awarded = True # type: ignore
            db.session.add(theUser)
            db.session.flush()
            db.session.commit()


    return jsonify(results), 200

@bp.route('/past_user_participated_challenges/', methods=['GET'])
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

@bp.route('/past_challenges/', methods=['GET'])
@login_required
def get_past_challenges():
    now = datetime.now(UTC)
    past_challenges = Challenge.query.filter(
        Challenge.end_time < now - timedelta(hours=24)
    ).all()

    return jsonify([challenge.to_json() for challenge in past_challenges]), 200


@bp.route('/<int:challenge_id>/invite/', methods=['POST'])
@login_required
def invite_friends_to_challenge(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404

    if challenge.creator != current_user.id and not ChallengeParticipant.query.filter_by(challenge_id=challenge_id, user_id=current_user.id).first():
        return jsonify({"message": "Permission denied"}), 403

    json = request.json
    if not json:
        return jsonify({"message": "Invalid request"}), 400
    friend_ids = json.get('friend_ids', [])
    for friend_id in friend_ids:
        # Check if an unread notification of this type already exists for this user and challenge
        existing_notification = UserNotifications.query.filter_by(
            user_id=friend_id,
            challenge_id=challenge_id,
            notification_type='challenge_reminder',
            isRead=False
        ).first()

        if not existing_notification:
            notification = UserNotifications(
                user_id=friend_id,  # type: ignore
                notification_text=f"{current_user.username} invited you join the challenge {challenge.name}.",  # type: ignore
                notification_type='challenge_reminder',  # type: ignore
                challenge_id=challenge_id  # type: ignore
            )
            db.session.add(notification)
    db.session.commit()

    return jsonify({"message": "Invitations sent successfully!"}), 200


@bp.route('/<int:challenge_id>/invite_response/', methods=['POST'])
@login_required
def handle_challenge_invite_response(challenge_id):
    json = request.json
    if not json:
        return jsonify({"message": "Invalid request"}), 400
    response = json.get('response')
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404
    
    UserNotifications.query.filter_by(
        user_id=current_user.id,  # type: ignore
        challenge_id=challenge_id,
        notification_type='challenge_reminder'
    ).delete()
    db.session.commit()

    if response == 'accept':
        participant = ChallengeParticipant(challenge_id=challenge_id, user_id=current_user.id) #type: ignore
        db.session.add(participant)
        db.session.commit()
        return jsonify({"message": "Challenge invitation accepted!"}), 200

    return jsonify({"message": "Challenge invitation denied!"}), 200
    

@bp.route('/<int:challenge_id>/kick/<int:user_id>/', methods=['POST'])
@login_required
def kick_user_from_challenge(challenge_id, user_id_to_kick):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404

    if challenge.creator != current_user.id:
        return jsonify({"message": "Permission denied"}), 403

    participant = ChallengeParticipant.query.filter_by(challenge_id=challenge_id, user_id=user_id_to_kick).first()
    if not participant:
        return jsonify({"message": "User not found in challenge"}), 404

    db.session.delete(participant)
    db.session.commit()

    return jsonify({"message": "User kicked successfully!"}), 200

def checkLevel():
    startingLevel = current_user.user_level
    current_user.user_level = math.floor(.1 * math.sqrt(.1 * current_user.xp_points)) + 1 # type: ignore
    db.session.add(current_user)
    db.session.commit()
    if(startingLevel != current_user.user_level):
        current_user.hasLeveled = 1
        db.session.add(current_user)
        db.session.commit()


@bp.route('/<int:challenge_id>/unviewed_invites/', methods=['GET'])
@login_required
def get_unviewed_invites(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404

    # Query unviewed invites for the challenge
    unviewed_invites = UserNotifications.query.filter_by(
        challenge_id=challenge_id,
        notification_type='challenge_reminder',
        isRead=False
    ).all()

    # Format the response
    invites_data = []

    for invite in unviewed_invites:
        invites_data.append({"user_id": invite.user_id})

    return jsonify(invites_data), 200


@bp.route('/<int:challenge_id>/invite_status/', methods=['GET'])
@login_required
def get_invite_status(challenge_id):
    challenge = Challenge.query.get(challenge_id)
    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404

    # Check if there is an unviewed invite for the current user
    invite = UserNotifications.query.filter_by(
        challenge_id=challenge_id,
        user_id=current_user.id,  # type: ignore
        notification_type='challenge_reminder',
    ).first()

    if invite:
        return jsonify({"isInvited": True, "notificationText": invite.notification_text}), 200

    return jsonify({"isInvited": False}), 200


@bp.route('/notifications/', methods=['GET'])
@login_required
def get_notifications():
    notifications = UserNotifications.query.filter_by(
            user_id=current_user.id,  # type: ignore
            notification_type='challenge_reminder'
        )
    return jsonify({
        "notifications": [notification.to_json() for notification in notifications]
    }), 200

@login_required
@bp.route("/<int:challenge_id>/reportChallenge/", methods=["GET", "POST"])
def report_challenge(challenge_id: int):
    if request.method == "GET":
        user: User = current_user._get_current_object() # type: ignore

        report: ChallengeReport = ChallengeReport.query.filter_by(user_id=user.id, challenge_id=challenge_id).first() # type: ignore

        if report != None:
            return jsonify({"alreadyReported": True, "id": user.id}), 200

        return jsonify({"alreadyReported": False, "id": user.id}), 200
    
    data = request.get_json()
    userId = data.get("user_id")
    reason = data.get("reason")
    challengeId = data.get("challenge_id")

    print("Received data - userID: " + str(userId))
    print("Received data - reason: " + str(reason))
    print("Received data - challengeID: " + str(challengeId))

    newReport: ChallengeReport = ChallengeReport(challenge_id=challengeId, user_id=userId, reason=reason) # type: ignore
    challenge: Challenge = Challenge.query.filter_by(id=challengeId).first() # type: ignore
    challenge.num_reports += 1

    try:
        db.session.add(newReport)
        db.session.commit()
        return jsonify({"message": f"Challenge {challengeId} reported"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error reporting challenge: {e}")
        return jsonify({"message": "Error: could not report challenge"}), 500

@login_required 
@bp.route('/get_user/<int:user_id>/', methods=['GET'])
def get_user(user_id):
    user = User.query.filter_by(id=user_id).first_or_404()
    return user.to_json(), 200
    
@login_required
@bp.get("/reported_challenges")
def get_reported_challenges():
    reportedChallenges: list[Challenge] = Challenge.query.filter(Challenge.num_reports > 0).all()
    return jsonify([challenge.to_json() for challenge in reportedChallenges]), 200

@login_required
@bp.get("/reports/<int:id>")
def get_reports(id: int): 
    reports: list[ChallengeReport] = ChallengeReport.query.filter_by(challenge_id=id).all()
    return jsonify([report.to_json() for report in reports])

@login_required
@bp.delete("/<int:id>/delete_reports")
def delete_reports(id: int):
    reports: list[ChallengeReport] = ChallengeReport.query.filter_by(challenge_id=id).all()

    for report in reports:
        db.session.delete(report)

    db.session.commit()
    return jsonify({"message": "Reports successfully deleted"}), 200

@login_required
@bp.post("/<int:id>/set_reports_zero")
def set_reports_zero(id: int):
    challenge: Challenge = Challenge.query.get(id) # type: ignore
    challenge.num_reports = 0

    db.session.commit()
    return jsonify({"message": "Dismissed reports successfully"}), 200

@login_required
@bp.delete("/<int:id>/delete")
def delete(id: int):
    challenge: Challenge = Challenge.query.get(id) # type: ignore

    if not challenge:
        return jsonify({"message": "Challenge not found"}), 404

    ChallengeVote.query.filter_by(challenge_id=id).delete()
    ChallengeParticipant.query.filter_by(challenge_id=id).delete()

    db.session.delete(challenge)
    db.session.commit()
    return jsonify({"message": "Challenge deleted successfully"}), 200
