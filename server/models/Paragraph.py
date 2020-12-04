from server.db import db
from sqlalchemy.dialects.postgresql import JSON


class Paragraph(db.Model):
    __tablename__ = 'paragraphs'

    paragraph_id = db.Column(db.Integer, primary_key=True)
    paragraph_text = db.Column(db.Text, nullable=False)

    def __init__(self, paragraph_text):
        self.paragraph_text = paragraph_text
