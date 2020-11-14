from server.db import db


class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(128), unique=False, nullable=False)
    last_name = db.Column(db.String(128), unique=False, nullable=False)
    username = db.Column(db.String(128), unique=True, nullable=False)
    password = db.Column(db.String(128), unique=True, nullable=False)
    role = db.Column(db.String(128), unique=False, nullable=False)
    active = db.Column(db.Boolean(), default=False, nullable=False)

    def __init__(self, first_name, last_name, username, password, role):
        self.first_name = first_name
        self.last_name = last_name
        self.username = username
        self.password = password
        self.role = role
