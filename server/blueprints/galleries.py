from flask import current_app, Blueprint, url_for, render_template, request, session, redirect
import json
from server.db import db
from server.models.Admin import Admin

galleries = Blueprint('galleries', __name__, template_folder='templates')


@galleries.route('', methods=["GET"])
def handle_images():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('galleries.html', user=session["username"], role=session["role"], title='Galleries')
