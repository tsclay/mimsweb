from server.db import db
from sqlalchemy.dialects.postgresql import JSON


class Setting(db.Model):
    __tablename__ = 'settings'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128), unique=True, nullable=False)
    password = db.Column(db.String(128), unique=True, nullable=False)
    active = db.Column(db.Boolean(), default=False, nullable=False)

    def __init__(self, username, password):
        self.username = username
        self.password = password
