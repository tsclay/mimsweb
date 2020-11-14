from server.db import db
from sqlalchemy.dialects.postgresql import JSON


class Blacklist(db.Model):
    __tablename__ = 'blacklist'

    id = db.Column(db.Integer, primary_key=True)
    quickbooks_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(128), nullable=False)
    start_date = db.Column(db.DateTime(), nullable=False)
    end_date = db.Column(db.DateTime(), nullable=True)
    reason = db.Column(db.String(128), nullable=False)

    def __init__(self, quickbooks_id, name, email, phone, start_date, end_date, reason):
        self.quickbooks_id = quickbooks_id
        self.name = name
        self.email = email
        self.phone = phone
        self.start_date = start_date
        self.end_date = end_date
        self.reason = reason
