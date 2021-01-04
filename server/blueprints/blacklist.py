from flask import json, request, Blueprint, render_template, session, redirect, url_for

blacklist = Blueprint('blacklist', __name__, template_folder='../templates')


@blacklist.route('', methods=["GET"])
def show_page():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    return render_template('blacklist.html', user=session["username"], role=session["role"], title='Blacklist')
