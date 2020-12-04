import datetime
from server.blueprints import decrypt
from datetime import timezone
from flask import Blueprint, url_for, render_template, request, session, redirect
import json
from server.db import db
from server.models.Admin import Admin

auth = Blueprint('auth', __name__, template_folder='templates')


@auth.route('', methods=["GET"])
def home():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('home.html', user=session["username"], role=session["role"], title='Home')


@auth.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "GET":
        message = request.args.get('message')
        if message is not None:
            return render_template('login.html', message=json.loads(message))
        else:
            return render_template('login.html')

    username = request.form["username"]
    password = request.form["password"]
    found_user = Admin.query.filter_by(
        username=username).first()
    if found_user is not None and \
            username == found_user.username and \
            password == decrypt(found_user.password):
        session["username"] = request.form["username"]
        session["role"] = found_user.role
        found_user.active = True
        found_user.last_logged_in = datetime.datetime.now(timezone.utc)
        db.session.add(found_user)
        db.session.commit()
        return redirect(url_for('auth.home'))
    else:
        return redirect(url_for('auth.login', message=json.dumps({"error": "Double-check your credentials and try again."})))


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
