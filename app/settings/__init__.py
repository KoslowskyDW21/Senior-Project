import os
from flask import Blueprint

bp_dir:        str = os.path.abspath(os.path.dirname(__file__))
templates_dir: str = os.path.join(bp_dir, 'templates')

bp = Blueprint('settings', __name__, template_folder=templates_dir)

from app.settings import routes