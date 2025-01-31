from __future__ import annotations
from app.groups import bp
from app.models import *
from app.login.loginforms import RegisterForm, LoginForm
from datetime import datetime
from flask import request, jsonify, render_template, redirect, url_for, flash, current_app
from flask_login import login_required
from flask_login import current_user, login_user, logout_user
import os
from werkzeug.utils import secure_filename
import uuid


#default route just for the time being
@bp.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the API!"}), 200
