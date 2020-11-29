from server.models.Galleries import Galleries
from flask import current_app, Blueprint, url_for, render_template, request, session, redirect
import datetime
import json
from server.db import db
from server.models.Admin import Admin
from server.models.Gallery_Info import Gallery_Info
from server.models.Galleries import Galleries
from server.models.Image import Image

galleries = Blueprint('galleries', __name__, template_folder='templates')


def fetch_galleries():
    all_galleries = []
    results = Galleries.query.outerjoin(Gallery_Info, Gallery_Info.id == Galleries.info_id).outerjoin(
        Image, Image.id == Galleries.image_id).order_by(Galleries.id).all()

    if len(results) == 0:
        return json.dumps({"message": "No galleries! Get started by creating one!"})

# Loop thru all rows, need to diff by galleries.id becuase ALL images are returned
    marker = results[0].info_id
    end_of_results = results[-1].id
    gallery_json = {"id": results[0].info_id,
                    "gallery_name": results[0].gallery_info.gallery_name,
                    "description": results[0].gallery_info.description,
                    "last_updated_by": results[0].gallery_info.last_updated_by,
                    "last_updated": results[0].gallery_info.last_updated,
                    "images": []}
    # sql = f"SELECT gallery_info.*, images.* FROM galleries LEFT OUTER JOIN gallery_info ON gallery_info.id = galleries.info_id LEFT OUTER JOIN images ON images.id = galleries.image_id ORDER BY galleries.id;"
    # results = db.session.execute(sql)
    for row in results:
        # Change in row.info_id means the current row is part of next gallery
        # Append prev gallery and set up next one, change pointer to new current gallery
        if row.info_id != marker:
            all_galleries.append(gallery_json)
            gallery_json = {"id": row.info_id,
                            "gallery_name": row.gallery_info.gallery_name,
                            "description": row.gallery_info.description,
                            "last_updated_by": row.gallery_info.last_updated_by,
                            "last_updated": row.gallery_info.last_updated,
                            "images": []}
            marker = row.info_id

        image_id = row.gallery_image.id
        image_link = row.gallery_image.image_link
        image_name = row.gallery_image.image_name
        gallery_json['images'].append(
            {"id": image_id, "alt": image_name, "src": image_link})
        # Append the last gallery after adding the last image to it
        if row.id == end_of_results:
            all_galleries.append(gallery_json)

    def default(obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()

    return json.dumps(all_galleries, indent=2, default=default)


@ galleries.route('', methods=["GET"])
def handle_images():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('galleries.html', user=session["username"], role=session["role"], title='Galleries')


@ galleries.route('/read', methods=["GET"])
def get_galleries():
    return fetch_galleries()


@ galleries.route('/create', methods=["POST"])
def create_gallery():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    data = request.get_json()
    new_gallery_info = Gallery_Info(
        gallery_name=data["gallery_name"], description=data["description"], last_updated=datetime.datetime.now(), last_updated_by=session["username"])

    for num in data["images"]:
        new_gallery = Galleries()
        new_gallery.gallery_info = new_gallery_info
        new_gallery.gallery_image = Image.query.filter_by(id=num).first()
        db.session.add(new_gallery)

    db.session.add(new_gallery_info)
    db.session.commit()

    return fetch_galleries()


@ galleries.route('/update', methods=["PUT"])
def update_gallery():

    data = request.get_json()
    gallery_to_update = Galleries.query.filter_by(info_id=data["id"]).outerjoin(Gallery_Info, Gallery_Info.id == Galleries.info_id).outerjoin(
        Image, Image.id == Galleries.image_id).order_by(Galleries.id).all()

    return json.dumps(gallery_to_update)


@ galleries.route('/delete', methods=["DELETE"])
def delete_gallery():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    data = request.get_json()
    gallery_to_delete = Galleries.query.filter_by(
        info_id=data["gallery_id"]).all()

    for image in gallery_to_delete:
        db.session.delete(image)

    db.session.commit()
    return fetch_galleries()
