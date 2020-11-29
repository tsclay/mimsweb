from server.db import db


class Galleries(db.Model):
    __tablename__ = 'galleries'

    id = db.Column(db.Integer, primary_key=True)
    info_id = db.Column(db.Integer, db.ForeignKey(
        'gallery_info.id', ondelete="CASCADE"), nullable=False)
    image_id = db.Column(db.Integer, db.ForeignKey(
        'images.id'), nullable=True)
    gallery_image = db.relationship('Image', backref=db.backref('galleries', passive_deletes=True), foreign_keys=[image_id],
                                    lazy=True, uselist=False)
    gallery_info = db.relationship(
        'Gallery_Info', passive_deletes=True, lazy=True, uselist=False)

    # cascade="all, delete" on gallery_info conflicts with update func

    def __init__(self):
        pass
