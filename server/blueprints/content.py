from server.models.Client_Resources import Client_Resources
from flask import json, request, Blueprint, render_template, session, url_for, redirect
from server.models.Image import Image
from server.models.Paragraph import Paragraph
from server.models.Header import Header
from server.db import db
import os

content = Blueprint('content', __name__, template_folder='../templates')


def read():
    """
    ### Fetch all content rows, ordering by client-linked ones then row ids

    ```sql
    SELECT c.resource_id, h.*, p.*, i.* FROM headers h 
    LEFT OUTER JOIN client_resources c ON c.content_id = h.header_id 
    LEFT OUTER JOIN paragraphs p ON h.paragraph_id = p.paragraph_id 
    LEFT OUTER JOIN images i ON i.image_id = h.image_id 
    ORDER BY c.content_id, h.header_id;
    ```
    """
    results = Header.query.with_entities(Client_Resources.resource_id, Client_Resources.content_id, Header.header_id, Header.header_text, Paragraph.paragraph_id, Paragraph.paragraph_text, Image.image_id, Image.image_name, Image.image_link).outerjoin(Client_Resources, Client_Resources.content_id == Header.header_id).outerjoin(Paragraph, Paragraph.paragraph_id == Header.paragraph_id).outerjoin(
        Image, Image.image_id == Header.image_id).order_by(Client_Resources.content_id, Header.header_id).all()
    r_dict = []
    for row in results:
        image_id = row.image_id if hasattr(
            row, "image_id") and row.image_id is not None else -1
        image_name = row.image_name if hasattr(
            row, "image_name") and row.image_name is not None else 'Placeholder'
        image_link = row.image_link if hasattr(row, "image_link") and row.image_link is not None else url_for(
            'static', filename='assets/small-image.png')
        item = {
            "id": row.header_id,
            "resource_id": row.resource_id or None,
            "content_id": row.content_id or None,
            "header_text": row.header_text,
            "paragraph_id": row.paragraph_id,
            "paragraph_text": row.paragraph_text,
            "image_id": image_id,
            "image_name": image_name,
            "image_link": image_link
        }

        r_dict.append(item)

    return json.dumps(r_dict, indent=2)


@content.route('/admin', methods=["GET"])
def render():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('content.html', user=session["username"], role=session["role"], title="Content")


@content.route('/admin/all', methods=["GET"])
def show_all():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    payload = read()
    return payload


@content.route('/admin/create', methods=["POST"])
def create():
    if 'username' not in session:
        return redirect(url_for('auth.login'))
    try:
        data = request.get_json()
        new_header = Header(header_text=data['header_text'])
        new_paragraph = Paragraph(paragraph_text=data["paragraph_text"])
        new_header.h_image = Image.query.filter_by(
            image_id=data["image_id"]).first() or None
        new_header.h_paragraph = new_paragraph
        db.session.add(new_header)
        db.session.add(new_paragraph)
        db.session.commit()
        return read()
    except Exception as Error:
        return json.dumps({"message": "Error"})


@content.route('/admin/update', methods=["PUT"])
def update():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    data = request.get_json()
    # updated = content_data[data['id']]
    updated_header = Header.query.filter_by(
        header_id=data['header_id']).first()
    updated_header.header_text = data['header_text']
    updated_paragraph = Paragraph.query.filter_by(
        paragraph_id=data['paragraph_id']).first()
    updated_paragraph.paragraph_text = data["paragraph_text"]
    updated_header.image_id = data["image_id"]
    db.session.add(updated_header)
    db.session.add(updated_paragraph)
    db.session.commit()
    # sql = f"SELECT h.id, h.header_text, h.paragraph_id, p.paragraph_text, h.image_id, i.image_link FROM headers h INNER JOIN paragraphs p ON h.paragraph_id = p.id INNER JOIN images i ON h.image_id = i.id WHERE h.id = {data['header_id']};"
    # response = db.session.execute(sql).first()
    results = Header.query.filter_by(header_id=data['header_id']).join(Paragraph, Header.paragraph_id == Paragraph.paragraph_id).join(
        Image, Header.image_id == Image.image_id).first()
    return json.dumps({
        "id": results.header_id,
        "header_text": results.header_text,
        "paragraph_id": results.h_paragraph.paragraph_id,
        "paragraph_text": results.h_paragraph.paragraph_text,
        "image_id": results.h_image.image_id,
        "image_name": results.h_image.image_name,
        "image_link": results.h_image.image_link
    })

# Found out how to delete one header and delete para and image in same query


@content.route('/admin/delete', methods=["DELETE"])
def delete():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    data = request.get_json()
    del_header = Header.query.filter_by(header_id=data['header_id']).first()
    db.session.delete(del_header)
    db.session.commit()
    return read()
