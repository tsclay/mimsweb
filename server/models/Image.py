from server.db import db
from sqlalchemy.dialects.postgresql import JSON


class Image(db.Model):
    __tablename__ = 'images'

    image_id = db.Column(db.Integer, primary_key=True)
    image_link = db.Column(db.Text, nullable=False)
    image_name = db.Column(db.String(50), nullable=False)

    def __init__(self, image_link, image_name):
        self.image_link = image_link
        self.image_name = image_name
