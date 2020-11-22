from server.db import db


class Gallery(db.Model):
    __tablename__ = 'galleries'

    id = db.Column(db.Integer, primary_key=True)
    gallery_name = db.Column(db.String(128), unique=True, nullable=False)
    images = db.Column(db.ARRAY(db.String(128)), nullable=False)
    last_updated = db.Column(db.DateTime(False), nullable=True)
    last_updated_by = db.Column(db.String(128), nullable=True)

    def __init__(self, gallery_name,
                 images,
                 last_updated,
                 last_updated_by):
        self.gallery_name = gallery_name
        self.images = images
        self.last_updated = last_updated
        self.last_updated_by = last_updated_by
