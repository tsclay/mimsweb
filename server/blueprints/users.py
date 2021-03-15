from server.blueprints import encrypt_credentials
from flask import json, request, Blueprint, render_template, redirect, url_for
from server.db import db
from server.models.Admin import Admin
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage

users = Blueprint('users', __name__, template_folder='../templates')


@users.route('/admin/users/recovery', methods=['POST'])
def register_recovery():
    data = request.get_json()
    found_user = Admin.query.filter_by(email=data["email"]).filter_by(first_name=data["first_name"]).filter_by(
        last_name=data["last_name"]).filter_by(username=data["username"]).first()

    if found_user is not None:
        found_user.recovery_link = encrypt_credentials(data["email"])
        db.session.add(found_user)
        db.session.commit()

        href_link = f"http://0.0.0.0:4001/admin/users/recovery/{found_user.recovery_link}"

        port = os.environ["EMAIL_PORT"]
        smtp_server = os.environ["EMAIL_SERVER"]
        sender = os.environ["EMAIL_SENDER"]
        receiver = os.environ["EMAIL_RECEIVER"]
        password = os.environ["EMAIL_PASSWORD"]

        message = MIMEMultipart("alternative")
        receiver = data["email"]
        message["Subject"] = "Recover Managem Account"
        message["From"] = sender
        message["To"] = receiver
        text = f'Hi {data["first_name"]},\n\n \
            Visit the link below to reset your login credentials for the Managem portal associated with mimspainting.com:\n\n \
              {href_link}\n\n\
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
                <p style="margin: 0 0 1.25rem 0;">Visit the link below to reset your login credentials for the Managem portal associated with mimspainting.com:
                </p>
                <p style="margin: 0 0 1.25rem 0;"><a href="{href_link}">Recover account</a></p>
                <p style="margin: 0 0 1.25rem 0;">Best regards,</p>
                <p style="margin: 0;">Mims Family Painting</p>
              </div>
            </body>
        </html>
        """.format(name=data["first_name"], href_link=href_link)
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

        return json.dumps({"message": "A recovery link has been sent to your email. Open it and click the link to recover your account."})

    else:
        return json.dumps({"message": "Double-check your credentials and try again."})


@users.route('/admin/users/recovery/<recovery_link>', methods=["GET", "POST"])
def handle_recovery(recovery_link):
    found_user = Admin.query.filter_by(recovery_link=recovery_link).first()
    if request.method == 'GET' and found_user is not None:
        return render_template('recovery.html', title="Account Recovery", url=f"/admin/users/recovery/{recovery_link}")
    elif request.method == 'POST' and found_user is not None:
        data = request.form
        found_user.password = encrypt_credentials(data["password"])
        found_user.recovery_link = None
        db.session.add(found_user)
        db.session.commit()
        return redirect(url_for('auth.login', message=json.dumps({"message": "Password updated!"})))
    else:
        return redirect(url_for('auth.login', message=json.dumps({"message": "Double-check your credentials and try again."})))
