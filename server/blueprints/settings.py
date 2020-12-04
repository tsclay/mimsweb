from flask import json, request, Blueprint, render_template, session, redirect, url_for
from server.blueprints import encrypt_credentials
from server.db import db
from server.models.Admin import Admin
import uuid
import os
import smtplib
import ssl
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage

settings = Blueprint('settings', __name__, template_folder='templates')


# def encrypt_credentials(user_cred):
#     secret = current_app.config["SECRET_KEY"]
#     password = bytes(secret, "utf-8")
#     salt = os.environ["SALT"]
#     kdf = PBKDF2HMAC(
#         algorithm=hashes.SHA256(),
#         length=32,
#         salt=salt,
#         iterations=100000,
#     )
#     key = base64.urlsafe_b64encode(kdf.derive(password))
#     f = Fernet(key)
#     str_to_encrypt = bytes(user_cred, "utf-8")
#     encrypted_str = f.encrypt(str_to_encrypt).decode("utf-8")
#     return encrypted_str


def fetch_users():
    all_users = Admin.query.order_by(Admin.user_id).all()
    payload = []

    for user in all_users:
        payload.append({
            "id": user.user_id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "last_logged_in": user.last_logged_in
        })

    def default(obj):
        if isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()

    return json.dumps(payload, indent=2, default=default)


@settings.route('/admin/settings', methods=["GET"])
def show_page():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    current_user = Admin.query.filter_by(username=session['username']).first()

    return render_template('settings.html', user=session["username"], role=session["role"], title='Settings', current_user=current_user)


@settings.route('/admin/settings', methods=["POST"])
def change_settings():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    current_user = Admin.query.filter_by(username=session['username']).first()

    updates = request.get_json()

    current_user.first_name = updates["first_name"] if updates["first_name"] != '' else current_user.first_name
    current_user.last_name = updates["last_name"] if updates['last_name'] != '' else current_user.last_name
    current_user.password = encrypt_credentials(
        updates["password"]) if updates['password'] != '' else current_user.password
    new_username = None

    if "first_name" in updates and updates["first_name"] != '':
        new_username = updates["first_name"][0].lower()
    else:
        new_username = current_user.username[0]

    if "last_name" in updates and updates['last_name'] != '':
        new_username = new_username + updates["last_name"].lower()
    else:
        new_username = new_username + current_user.username[1:]
    # current_user.role = updates["role"] if updates['role'] != '' else current_user.role

    current_user.username = new_username

    db.session.add(current_user)
    db.session.commit()

    session['username'] = current_user.username

    updated_user = {
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "username": current_user.username,
        "role": current_user.role,
    }

    return json.dumps(updated_user)


@settings.route('/admin/create-user', methods=["POST"])
def create_user():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    if session["role"] != 'admin':
        return json.dumps({"message": "Unauthorized"})

    data = request.get_json()
    new_user = Admin(first_name=data["first_name"], last_name=data["last_name"], email=data["email"], recovery_link=None,
                     username=f"{data['first_name'][0].lower()}{data['last_name'].lower()}", password=uuid.uuid4().hex, role=data["role"], last_logged_in=None)

    db.session.add(new_user)
    db.session.commit()

    port = os.environ["EMAIL_PORT"]
    smtp_server = os.environ["EMAIL_SERVER"]
    sender = os.environ["EMAIL_SENDER"]
    receiver = os.environ["EMAIL_RECEIVER"]
    password = os.environ["EMAIL_PASSWORD"]

    message = MIMEMultipart("alternative")
    receiver = new_user.email
    message["Subject"] = "Managem Portal Credentials"
    message["From"] = sender
    message["To"] = receiver
    text = f'Hi {data["first_name"]},\n\n \
        An admin in charge of the managem portal for mimspainting.com has created an account for you.\n\n\
            Here are your login credentials:\n\n\
                Your name: {new_user.first_name} {new_user.last_name}\n\
                Username: {new_user.username}\n\
                    Password: {new_user.password}\n\n\
                        Visit mfpfinishes.com/admin to login for the first time. Once you log in, you may change your password\
                            to one of your choosing.\n\n\
        Best regards,\n \
        Mims Family Painting'
    html = """\
    <html>
        <head>
        </head>
        <body
          style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
          border: 20px solid black;
          box-sizing: border-box;
          max-width: 680px;
          margin: 0 auto;
          color: black;
        ">
          <div style="padding: 2.5rem; background: #faf8f4; box-sizing: border-box;">
             <img
              style="
                width: 80%;
                background: rgba(141, 141, 141, 0.5);
                border: black solid 4px;
                margin: 0 auto 2rem auto;
                display: block;
                box-sizing: border-box;
                padding: 8px;
              "
              src="cid:image1"
              alt="Mims Family Painting"
            />
            <p style="margin: 0 0 1.25rem 0;">Hi {name},</p>
            <p style="margin: 0 0 1.25rem 0;">An admin in charge of the managem portal for mimspainting.com has created an account for you.
            </p>
            <p style="margin: 0 0 1.25rem 0;">Here are your login credentials:</p>
            <p style="margin: 0 0 1.25rem 0;">Your name: {first_name} {last_name}<br/>Username: {username}<br/>\
                    Password: {password}</p>
            <p style="margin: 0 0 1.25rem 0;">Visit <a href="mfpfinishes.com/admin">mfpfinishes.com/admin</a> to login for the first time. Once you log in, you may change your password\
                            to one of your choosing.</p>
            <p style="margin: 0 0 1.25rem 0;">Best regards,</p>
            <p style="margin: 0;">Mims Family Painting</p>
          </div>
        </body>
    </html>
    """.format(name=new_user.first_name, first_name=new_user.first_name, last_name=new_user.last_name, username=new_user.username, password=new_user.password)
    context = ssl.create_default_context()

    fp = open(os.getcwd() + '/client/public/assets/img/NEWNEWLOGO.png', 'rb')
    msgImage = MIMEImage(fp.read())
    fp.close()

    msgImage.add_header('Content-ID', '<image1>')

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    message.attach(part1)
    message.attach(part2)

    message.attach(msgImage)

    with smtplib.SMTP_SSL(smtp_server, port, context=context) as responder:
        responder.login(sender, password)
        responder.sendmail(sender, receiver, message.as_string())
        responder.close()

    return fetch_users()


@settings.route('/admin/users', methods=['GET', 'DELETE'])
def read():
    if 'username' not in session:
        return redirect(url_for('auth.login'))

    if request.method == 'GET':
        if session["role"] == 'manager' or session["role"] == 'admin':
            return fetch_users()
        else:
            return json.dumps({"message": "Unauthorized"})

    if request.method == 'DELETE':
        if session["role"] != 'admin':
            return json.dumps({"message": "Unauthorized"})
        data = request.get_json()
        user_to_delete = Admin.query.filter_by(user_id=data["id"]).first()
        db.session.delete(user_to_delete)
        db.session.commit()
        return fetch_users()
