from flask import current_app, Blueprint, url_for, render_template, request, session, redirect
import json
from server.db import db
from server.models.Admin import Admin

auth = Blueprint('auth', __name__, template_folder='templates')


@auth.route('', methods=["GET"])
def home():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('home.html', user=session["username"], title='Home')


@auth.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template('login.html')

    username = request.form["username"]
    password = request.form["password"]
    found_user = Admin.query.filter_by(
        username=username).first()
    if found_user == None:
        return redirect(url_for('auth.login'))
    elif username == found_user.username and password == found_user.password:
        session["username"] = request.form["username"]
        found_user.active = True
        db.session.add(found_user)
        db.session.commit()
        return redirect(url_for('auth.home'))
    else:
        return redirect(url_for('auth.login'))


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
    return json.dumps({"message": 'Logout successful'})
