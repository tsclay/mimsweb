from server.db import db


class Gallery_Info(db.Model):
    __tablename__ = 'gallery_info'

    gallery_id = db.Column(db.Integer, primary_key=True)
    gallery_name = db.Column(db.String(128), unique=True, nullable=False)
    description = db.Column(db.Text(), nullable=True)
    last_updated = db.Column(db.DateTime(False), nullable=True)
    last_updated_by = db.Column(db.String(128), nullable=True)
    # galleries_rel = db.relationship('Galleries', backref=db.backref(
    #     "Galleries"), ondelete="cascade")

    def __init__(self, gallery_name,
                 description,
                 last_updated,
                 last_updated_by):
        self.gallery_name = gallery_name
        self.description = description
        self.last_updated = last_updated
        self.last_updated_by = last_updated_by
