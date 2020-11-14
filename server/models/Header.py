from server.db import db
from sqlalchemy.dialects.postgresql import JSON


class Header(db.Model):
    __tablename__ = 'headers'

    id = db.Column(db.Integer, primary_key=True)
    header_text = db.Column(db.Text, nullable=False)
    image_id = db.Column(db.Integer, db.ForeignKey(
        'images.id', ondelete="SET NULL"), nullable=True)
    paragraph_id = db.Column(
        db.Integer, db.ForeignKey('paragraphs.id'), nullable=False)
    h_image = db.relationship('Image', backref=db.backref('headers', passive_deletes=True), foreign_keys=[image_id],
                              lazy=True, uselist=False)
    h_paragraph = db.relationship(
        'Paragraph', backref='header', foreign_keys=[paragraph_id], lazy=True, cascade="all, delete", uselist=False)

    def __init__(self, header_text):
        self.header_text = header_text
        # self.image_id = image_id
        # self.paragraph_id = paragraph_id

    def __repr__(self):
        return f'<Header {self.id}, {self.header_text}><Paragraph {self.h_paragraph.id}, {self.h_paragraph.paragraph_text}><Image {self.h_image.id}, {self.h_image.image_name}, {self.h_image.image_link}>'


# SELECT images.image_link, headers.header_text, paragraphs.paragraph_text FROM images INNER JOIN headers ON images.id = headers.id INNER JOIN paragraphs ON paragraphs.id = images.id
