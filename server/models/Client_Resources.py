from server.db import db


class Client_Resources(db.Model):
    __tablename__ = 'client_resources'

    resource_id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.Integer, db.ForeignKey(
        'headers.header_id'), nullable=True)
    gallery_id = db.Column(db.Integer, db.ForeignKey(
        'gallery_info.gallery_id'), nullable=True)
    linked_content = db.relationship(
        'Header', passive_deletes=True, foreign_keys=[content_id], lazy=True, uselist=False)
    linked_gallery = db.relationship(
        'Gallery_Info', passive_deletes=True, foreign_keys=[gallery_id], lazy=True, uselist=False)

    # cascade="all, delete" on gallery_info conflicts with update func

    def __init__(self):
        pass
