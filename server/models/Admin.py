from enum import unique
from server.db import db


class Admin(db.Model):
    __tablename__ = 'admins'

    user_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(128), unique=False, nullable=False)
    last_name = db.Column(db.String(128), unique=False, nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    username = db.Column(db.String(128), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    role = db.Column(db.String(128), unique=False, nullable=False)
    recovery_link = db.Column(db.Text, unique=False, nullable=True)
    active = db.Column(db.Boolean(), default=False, nullable=False)
    last_logged_in = db.Column(db.DateTime(False), nullable=True)

    def __init__(self, first_name, last_name, email, username, password, role, recovery_link, last_logged_in):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.username = username
        self.password = password
        self.recovery_link = recovery_link
        self.role = role
        self.last_logged_in = last_logged_in
