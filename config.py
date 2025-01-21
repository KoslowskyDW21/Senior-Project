import os
from dotenv import load_dotenv

# record the absolute path of the directory in which this file is located
basedir: str = os.path.abspath(os.path.dirname(__file__))
# load any config options from the environment variable file
load_dotenv(os.path.join(basedir, '.appenv'))

# define a config singleton to be used in configuring apps
class Config:
    # for each config option find it in an environment variable
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # during debugging disable caching (remove for final version)
    SEND_FILE_MAX_AGE_DEFAULT = 0
    #Configure uploading image
    BASE_DIR = os.path.abspath(os.path.dirname(__file__)) 
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')  
