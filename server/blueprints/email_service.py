from flask import Blueprint, request, render_template
import smtplib
import ssl
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import base64

email_service = Blueprint('emailer', __name__, template_folder='templates')


@email_service.route('/submit-form', methods=["POST"])
def send_email():

    # Get form data
    data = request.get_json() or request.form
    name = data["name"]

    CLIENT_ID = "634234012352-dgrj19j5g6v44rfqpfosj3sgsbm6i8re.apps.googleusercontent.com"
    CLIENT_SECRET = "y4vFXQ2RrQQ2zY-dkZkNU-2n"
    REFRESH_TOKEN = "1//04d5czzr1EefQCgYIARAAGAQSNwF-L9IrRHWsKcKlVjbp0XHanLpRWjtPRyBt_7U5gWyz8mgHtozmbuzpSlDSmPYcS7i5Sn0lTyE"
    ACCESS_TOKEN = "ya29.a0AfH6SMAcb1uXyAS4wzA2qYOVOx2DkYVCfDK5n_acWeY0oJPxPmlTk7fX4qh1l_xFhHC1ab5zDCE2psiV0FWL3rQ79FErK2gmi1VEtgHjvxqo7HjyiBSCJuZ7iyiJeB4wHLRNQu4U9QjIIbncQ6fxABAu9kq7E2VnHAWI5j3dGuU"

    # Configure the emailer, first setting sender and receiver to business
    port = 587
    smtp_server = "smtp.gmail.com"
    sender = "web.mailer.mimspainting@gmail.com"
    receiver = os.environ["EMAIL_RECEIVER"]
    password = os.environ["EMAIL_PASSWORD"]
    user = "web.mailer.mimspainting@gmail.com"

    auth_string = bytes(
        f"user={user}^Aauth=Bearer {ACCESS_TOKEN}^A^A", 'utf-8')

    # Create message from form message to send to business
    text = f'{data["message"]}\n\n\
        {data["name"]}\n\
        {data["address"] if ("address" in data and data["address"] is not None) else "No physical address provided."}\n\
        {data["email"]}\n\
        Preffered Contact Method: {data["pref_contact"]}'
    message = MIMEMultipart()
    message["Subject"] = "Message from MFP Website"
    message["From"] = sender
    message["To"] = receiver
    message.attach(MIMEText(text, 'plain'))
    context = ssl.create_default_context()

    with smtplib.SMTP(smtp_server, port) as emailer:
        emailer.ehlo(CLIENT_ID)
        emailer.starttls(context=context)
        emailer.ehlo(CLIENT_ID)
        # emailer.login(sender, password)
        emailer.docmd('AUTH', 'XOAUTH2 ' + auth_string.decode('utf-8'))
        emailer.sendmail(sender, receiver, message.as_string())
        emailer.close()

    # Create auto-reply to confirm that client's message did send
    # Will try to send html first; send text if not possible
    pref_message = ''
    if data["pref_contact"] == 'both':
        pref_message = 'by phone call and/or email'
    elif data["pref_contact"] == 'phone':
        pref_message = 'by phone call'
    else:
        pref_message = 'by email'

    reply = MIMEMultipart("alternative")
    receiver = data["email"]
    reply["Subject"] = "MFP Got Your Message!"
    reply["From"] = sender
    reply["To"] = receiver
    text = f'Hi {data["name"]},\n\n \
        Thank you for contacting us at Mims Family Painting. We will review\
        your message and reply to you within 2 business days (Monday - Friday) {pref_message}.\n\n \
        We look forward to speaking with you soon.\n\n \
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
            <p style="margin: 0 0 1.25rem 0;">Thank you for contacting us at Mims Family Painting. We will review your message and reply to you within 2 business days (Monday - Friday) {pref_message}.
            </p>
            <p style="margin: 0 0 1.25rem 0;">We look forward to speaking with you soon.</p>
            <p style="margin: 0 0 1.25rem 0;">Best regards,</p>
            <p style="margin: 0;">Mims Family Painting</p>
          </div>
        </body>
    </html>
    """.format(name=data["name"], pref_message=pref_message)

    fp = open(os.getcwd() + '/client/public/assets/img/NEWNEWLOGO.png', 'rb')
    msgImage = MIMEImage(fp.read())
    fp.close()

    msgImage.add_header('Content-ID', '<image1>')

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    reply.attach(part1)
    reply.attach(part2)

    reply.attach(msgImage)

    with smtplib.SMTP(smtp_server, port) as responder:
        responder.ehlo(CLIENT_ID)
        responder.starttls(context=context)
        responder.ehlo(CLIENT_ID)
        # responder.login(sender, password)
        responder.docmd('AUTH', 'XOAUTH2 ' + base64.b64encode(auth_string))
        responder.sendmail(sender, receiver, message.as_string())
        responder.close()

    return json.dumps({
        'message': 'Success!',
        'image': os.getcwd() + '/client/public/assets/img/NEWNEWLOGO.png'
    })
