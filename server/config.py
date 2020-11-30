import os
basedir = os.path.abspath(os.path.dirname(__file__))

# driver = 'postgresql+psycopg2://'

# connection_string = connection_string = driver \
#     + os.environ['RDS_USERNAME'] + ':' + os.environ['RDS_PASSWORD'] \
#     + '@' + os.environ['RDS_HOSTNAME'] + ':' + os.environ['RDS_PORT'] \
#     + '/' + os.environ['RDS_DB_NAME']


class Config(object):
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ["SECRET_KEY"]
    PREFERRED_URL_SCHEME = 'https'
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = 'server/static/assets/uploads'
