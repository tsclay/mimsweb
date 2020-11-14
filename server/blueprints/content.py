from flask import json, request, Blueprint, render_template, session, url_for, redirect
from server.models.Image import Image
from server.models.Paragraph import Paragraph
from server.models.Header import Header
from server.db import db
import server
from sqlalchemy import or_
from sqlalchemy.sql.operators import is_

content = Blueprint('content', __name__, template_folder='templates')


@content.route('', methods=["GET"])
def render():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('content.html', user=session["username"], title="Content")


@content.route('/all', methods=["GET", "DELETE"])
def read():
    if 'username' not in session:
        return redirect(url_for('auth.login'))
    # sql = "SELECT * FROM headers h LEFT OUTER JOIN paragraphs p ON h.paragraph_id = p.id LEFT OUTER JOIN images i ON i.id = h.image_id ORDER BY h.id;"
    # results = db.session.execute(sql)
    results = Header.query.outerjoin(Paragraph, Paragraph.id == Header.paragraph_id).outerjoin(
        Image, Image.id == Header.image_id).order_by(Header.id).all()
    r_dict = []
    for row in results:
        image_id = row.h_image.id if hasattr(row.h_image, "id") else -1
        image_name = row.h_image.image_name if hasattr(
            row.h_image, "image_name") else 'Placeholder'
        image_link = row.h_image.image_link if hasattr(row.h_image, "image_link") else url_for(
            'static', filename='assets/icons/image-icon.inkscape.png')
        item = {
            "id": row.id,
            "header_text": row.header_text,
            "paragraph_id": row.h_paragraph.id,
            "paragraph_text": row.h_paragraph.paragraph_text,
            "image_id": image_id,
            "image_name": image_name,
            "image_link": image_link
        }

        r_dict.append(item)

    return json.dumps(r_dict, indent=2)


@content.route('/create', methods=["POST"])
def create():
    if 'username' not in session:
        return redirect(url_for('auth.login'))
    try:
        data = request.get_json()
        new_header = Header(header_text=data['header_text'])
        new_paragraph = Paragraph(paragraph_text=data["paragraph_text"])
        new_header.h_image = Image.query.filter_by(
            id=data["image_id"]).first() or None
        new_header.h_paragraph = new_paragraph
        db.session.add(new_header)
        db.session.add(new_paragraph)
        db.session.commit()
        return redirect(url_for('.read'))
    except Exception as Error:
        return json.dumps({"message": "Error"})


@content.route('/update', methods=["PUT"])
def update():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    data = request.get_json()
    # updated = content_data[data['id']]
    updated_header = Header.query.filter_by(id=data['header_id']).first()
    updated_header.header_text = data['header_text']
    updated_paragraph = Paragraph.query.filter_by(
        id=data['paragraph_id']).first()
    updated_paragraph.paragraph_text = data["paragraph_text"]
    updated_header.image_id = data["image_id"]
    db.session.add(updated_header)
    db.session.add(updated_paragraph)
    db.session.commit()
    # sql = f"SELECT h.id, h.header_text, h.paragraph_id, p.paragraph_text, h.image_id, i.image_link FROM headers h INNER JOIN paragraphs p ON h.paragraph_id = p.id INNER JOIN images i ON h.image_id = i.id WHERE h.id = {data['header_id']};"
    # response = db.session.execute(sql).first()
    results = Header.query.filter_by(id=data['header_id']).join(Paragraph, Header.paragraph_id == Paragraph.id).join(
        Image, Header.image_id == Image.id).first()
    return json.dumps({
        "id": results.id,
        "header_text": results.header_text,
        "paragraph_id": results.h_paragraph.id,
        "paragraph_text": results.h_paragraph.paragraph_text,
        "image_id": results.h_image.id,
        "image_name": results.h_image.image_name,
        "image_link": results.h_image.image_link
    })

# Found out how to delete one header and delete para and image in same query


@content.route('/delete', methods=["DELETE"])
def delete():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    data = request.get_json()
    del_header = Header.query.filter_by(id=data['header_id']).first()
    db.session.delete(del_header)
    db.session.commit()
    return redirect(url_for('.read'))
