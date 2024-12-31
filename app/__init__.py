from flask import Flask, request, current_app
from config import Config
from flask_login import LoginManager
from app.models import User, db

login_manager = LoginManager()

def create_app(config=Config):
    # create the flask app and set all its config options based on a config object
    app = Flask(__name__)
    app.config.from_object(config)
    # TODO: connect SQLite3 and Flask-Login HERE
    # Prepare and connect the LoginManager to this app
    login_manager.init_app(app)
    # function name of the route that has the login form (so it can redirect users)
    login_manager.login_view = 'get_login' # type: ignore
    login_manager.session_protection = "strong"

    db.init_app(app)  # Initialize the SQLAlchemy instance with the app
    with app.app_context():
        db.create_all()  # Create database tables if they don't exist
        
    # connect the core endpoints
    from app.login import bp as login_bp
    app.register_blueprint(login_bp, url_prefix='/')
    return app

@login_manager.user_loader
def load_user(uid: int) -> User | None:
    return User.query.get(int(uid))