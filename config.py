import os
from dotenv import load_dotenv

# record the absolute path of the directory in which this file is located
basedir: str = os.path.abspath(os.path.dirname(__file__))
# load any config options from the environment variable file
load_dotenv(os.path.join(basedir, '.appenv'))
scriptdir = os.path.dirname(os.path.abspath(__file__))
dbfile = os.path.join(scriptdir, "users.sqlite3")

# define a config singleton to be used in configuring apps
class Config:
    # for each config option either find it in an environment variable or use a default
    SECRET_KEY = os.environ.get('SECRET_KEY')
    # NOTE this is using a temporary local database, use the commented out environmental
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # during debugging disable caching (remove for final version)
    SEND_FILE_MAX_AGE_DEFAULT = 0
