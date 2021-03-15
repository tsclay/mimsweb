import datetime
from flask.helpers import make_response

from flask.json import jsonify
from server.blueprints import decrypt
from datetime import timezone
from flask import Blueprint, url_for, render_template, request, session, redirect
import json
from server.db import db
from server.models.Admin import Admin
from server.limiter import limiter

auth = Blueprint('auth', __name__, template_folder='../templates')


@auth.errorhandler(429)
def handle_excess_attempts(e):
    return make_response(jsonify(error="For security reasons, you are unable to make login attempts for one hour."), 429)


@auth.route('', methods=["GET"])
def home():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('home.html', user=session["username"], role=session["role"], title='Home')


@auth.route('/login', methods=["GET", "POST"])
@limiter.limit('5/hour', override_defaults=True, deduct_when=lambda response: response.status_code == 401)
def login():
    if request.method == "GET":
        message = request.args.get('message')
        if message is not None:
            return render_template('login.html', message=json.loads(message))
        else:
            return render_template('login.html')

    data = request.get_json()
    username = data["username"]
    password = data["password"]
    found_user = Admin.query.filter_by(
        username=username).first()
    if found_user is not None and \
            username == found_user.username and \
            password == decrypt(found_user.password):
        session["username"] = found_user.username
        session["role"] = found_user.role
        found_user.active = True
        found_user.last_logged_in = datetime.datetime.now(timezone.utc)
        db.session.add(found_user)
        db.session.commit()
        return redirect(url_for('auth.home'), 302)
    else:
        return make_response(jsonify(error="Double-check your credentials and try again."), 401)


@auth.route('/logout', methods=["POST"])
def logout():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    found_user = Admin.query.filter_by(
        username=session['username']).first()
    found_user.active = False
    db.session.add(found_user)
    db.session.commit()
    session.pop('username', None)
    session.pop('role', None)
    return json.dumps({"message": 'Logout successful'})
