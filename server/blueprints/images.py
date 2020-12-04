from flask import current_app, Blueprint, render_template, request, session, redirect, url_for
import json
import os
from werkzeug.utils import secure_filename
from server.db import db
import server
from server.models.Image import Image
from server.models.Header import Header

images = Blueprint('images', __name__, template_folder='templates')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_images():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    db_images = Image.query.order_by(Image.image_id).all()
    payload = []
    for row in db_images:
        payload.append({"id": row.image_id,
                        "image_name": row.image_name,
                        "image_link": row.image_link})
    return json.dumps(payload)


@images.route('', methods=["GET"])
def handle_images():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('images.html', user=session["username"], role=session["role"], title='Images')


@images.route('/create', methods=["POST"])
def post_images():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    if 'new_image' not in request.files:
        return redirect('/asset-editor')

    file = request.files['new_image']

    if file.filename != "" and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
        db.session.add(Image(image_link='/static/assets/uploads/' +
                             filename, image_name=request.form["image_name"]))
        db.session.commit()
        return get_images()
    else:
        return redirect('/admin/asset-editor')


@images.route('/replace', methods=["POST"])
def replace_image():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    file = request.files['new_image']

    if file.filename != "" and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
        db_image = Image.query.filter_by(
            image_id=request.form["image_id"]).first()
        old_image_path = 'server' + db_image.image_link
        os.remove(old_image_path)
        db_image.image_link = '/static/assets/uploads/' + filename
        db_image.image_name = request.form["image_name"]
        db.session.add(db_image)
        db.session.commit()
        return get_images()
    else:
        return redirect('/admin/asset-editor')


@images.route('/read', methods=["GET", "DELETE"])
def show_all_images():
    return get_images()


@images.route('/delete', methods=["DELETE", "POST"])
def delete_image():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    if request.method == 'DELETE':
        data = request.get_json()
        del_image = Image.query.filter_by(image_id=data['image_id']).first()
        os.remove("server" + del_image.image_link)
        db.session.delete(del_image)
        db.session.commit()
        payload = get_images()
        return payload
        # return redirect(url_for('.get_images'))
    elif request.method == 'POST':
        data = request.get_json()
        paired_headers = Header.query.filter_by(
            image_id=data['image_id']).all()
        payload = []
        if len(paired_headers) == 0:
            payload.append({"message": 0})
        else:
            payload.append({"message": 1})
            for row in paired_headers:
                payload.append({"linked_content": row.image_id})

        return json.dumps(payload)
