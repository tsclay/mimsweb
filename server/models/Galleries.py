from server.db import db


class Galleries(db.Model):
    __tablename__ = 'galleries'

    id = db.Column(db.Integer, primary_key=True)
    info_id = db.Column(db.Integer, db.ForeignKey(
        'gallery_info.id', ondelete="SET NULL"), nullable=True)
    image_id = db.Column(db.Integer, db.ForeignKey(
        'images.id', ondelete="SET NULL"), nullable=True)
    gallery_image = db.relationship('Image', backref=db.backref('galleries', passive_deletes=True), foreign_keys=[image_id],
                                    lazy=True, uselist=False)
    gallery_info = db.relationship(
        'Gallery_Info', backref='galleries', foreign_keys=[info_id], lazy=True, cascade="all, delete", uselist=False)

    def __init__(self):
        pass
