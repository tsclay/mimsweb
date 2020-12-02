from flask import Blueprint, request, render_template
import smtplib
import ssl
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os

email_service = Blueprint('emailer', __name__, template_folder='templates')


@email_service.route('/submit-form', methods=["POST"])
def send_email():

    # Get form data
    data = request.get_json() or request.form
    name = data["name"]

    # Configure the emailer, first setting sender and receiver to business
    port = os.environ["EMAIL_PORT"]
    smtp_server = os.environ["EMAIL_SERVER"]
    sender = os.environ["EMAIL_SENDER"]
    receiver = os.environ["EMAIL_RECEIVER"]
    password = os.environ["EMAIL_PASSWORD"]

    # Create message from form message to send to business
    text = f'{data["message"]}\n\n\
        {data["name"]}\n\
        {data["email"]}\n\
        {data["pref_contact"]}'
    message = MIMEMultipart()
    message["Subject"] = "Message from MFP Website"
    message["From"] = sender
    message["To"] = receiver
    message.attach(MIMEText(text, 'plain'))
    context = ssl.create_default_context()

    with smtplib.SMTP_SSL(smtp_server, port, context=context) as emailer:
        emailer.login(sender, password)
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

    with smtplib.SMTP_SSL(smtp_server, port, context=context) as responder:
        responder.login(sender, password)
        responder.sendmail(sender, receiver, reply.as_string())
        responder.close()

    return json.dumps({
        'message': 'Success!',
        'image': os.getcwd() + '/client/public/assets/img/NEWNEWLOGO.png'
    })
