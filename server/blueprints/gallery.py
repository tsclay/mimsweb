from server.models.Galleries import Galleries
from flask import current_app, Blueprint, url_for, render_template, request, session, redirect
from datetime import datetime
import json
from server.db import db
from server.models.Admin import Admin
from server.models.Gallery_Info import Gallery_Info
from server.models.Galleries import Galleries
from server.models.Image import Image

galleries = Blueprint('galleries', __name__, template_folder='templates')


@galleries.route('', methods=["GET"])
def handle_images():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('galleries.html', user=session["username"], role=session["role"], title='Galleries')


@galleries.route('/read', methods=["GET"])
def get_galleries():
    pass


@galleries.route('/create', methods=["POST"])
def create_gallery():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    data = request.get_json()
    new_gallery_info = Gallery_Info(
        gallery_name=data["gallery_name"], description=data["description"], last_updated=datetime.now(), last_updated_by=session["username"])

    for num in data["images"]:
        new_gallery = Galleries()
        new_gallery.gallery_info = new_gallery_info
        new_gallery.gallery_image = Image.query.filter_by(id=num).first()
        db.session.add(new_gallery)

    db.session.add(new_gallery_info)
    db.session.commit()

    results = Galleries.query.outerjoin(Gallery_Info, Gallery_Info.id == Galleries.info_id).outerjoin(
        Image, Image.id == Galleries.image_id).order_by(Galleries.id).all()

    gallery_json = {"gallery_name": results[0].gallery_info.gallery_name,
                    "description": results[0].gallery_info.description,
                    "last_updated_by": results[0].gallery_info.last_updated_by,
                    "images": []}

    for row in results:
        image = row.gallery_image.image_link
        gallery_json['images'].append(image)

    return json.dumps(gallery_json, indent=2)
