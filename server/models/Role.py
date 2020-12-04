from server.db import db


class Role(db.Model):
    __tablename__ = 'roles'

    role_id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(128), unique=True, nullable=False)
    permissions = db.Column(db.ARRAY(db.String(128)), nullable=False)

    def __init__(self, role_name, permissions):
        self.role_name = role_name
        self.permissions = permissions


# SELECT admins.*, roles.permissions FROM admins INNER JOIN roles ON admins.role = roles.role_name;
