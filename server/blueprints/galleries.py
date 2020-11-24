from flask import current_app, Blueprint, url_for, render_template, request, session, redirect
from datetime import datetime
import json
from server.db import db
from server.models.Admin import Admin
from server.models.Gallery import Gallery

galleries = Blueprint('galleries', __name__, template_folder='templates')


@galleries.route('', methods=["GET"])
def handle_images():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('galleries.html', user=session["username"], role=session["role"], title='Galleries')


@galleries.route('/create', methods=["POST"])
def create_gallery():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    data = request.get_json()
    new_gallery = Gallery(
        gallery_name=data["gallery_name"], description=data["description"], images=data["images"], last_updated=datetime.now(), last_updated_by=session["username"])

    db.session.add(new_gallery)
    db.session.commit()

    results = Gallery.query.order_by(Gallery.id).all()

    r_dict = []
    for row in results:
        gallery_name = row.gallery_name
        images = row.images
        description = row.description
        item = {
            "id": row.id,
            "gallery_name": gallery_name,
            "description": description,
            "images": images
        }

        r_dict.append(item)

    return json.dumps(r_dict, indent=2)
