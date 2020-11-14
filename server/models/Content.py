from server.db import db
from sqlalchemy.dialects.postgresql import JSON


class Content(db.Model):
    __tablename__ = "content"

    id = db.Column(db.Integer, primary_key=True)
    # header_id = db.Column(db.Integer, db.ForeignKey(
    #     'headers.id'), nullable=False)
    # paragraph_id = db.Column(db.Integer, db.ForeignKey(
    #     'paragraphs.id'), nullable=False)
    # image_id = db.Column(db.Integer, db.ForeignKey(
    #     'images.id'), nullable=False)

    # headers = db.relationship('headers', foreign_keys='content.header_id')
    # images = db.relationship('images', foreign_keys='content.image_id')
    # paragraphs = db.relationship(
    #     'paragraphs', foreign_keys='content.paragraphs_id')

    # def __init__(self, header_id, paragraph_id, image_id):
    #     self.header_id = header_id
    #     self.paragraph_id = paragraph_id
    #     self.image_id = image_id
