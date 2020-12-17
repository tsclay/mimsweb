from flask import Blueprint, request
import json
import email.utils
import mimetypes
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import base64
from server.blueprints import Create_Service


email_service = Blueprint('emailer', __name__, template_folder='templates')


def send_website_msg_to_business(mailer, website_json):
    # Configure the emailer, first setting sender and receiver to business
    sender = os.environ["EMAIL_SENDER"]
    receiver = os.environ["EMAIL_RECEIVER"]
    client_email = website_json["email"]

    # Create message from form message to send to business
    text = f'{website_json["message"]}\n\n\
    {website_json["name"]}\n\
    {website_json["address"] if ("address" in website_json and website_json["address"] is not None) else "No physical address provided."}\n\
    {website_json["email"]}\n\
    Preffered Contact Method: {website_json["pref_contact"]}'

    message = MIMEMultipart()
    message["Subject"] = "Message from MFP Website"
    message["From"] = f"MFP Website<{sender}>"
    message["Reply-To"] = client_email
    message["To"] = receiver
    message.attach(MIMEText(text, 'plain'))

    raw_string = base64.urlsafe_b64encode(message.as_bytes()).decode()

    try:
        mailer.users().messages().send(
            userId='me', body={'raw': raw_string}).execute()

        return 200
    except Exception as e:
        raise RuntimeError(
            "Failed to send email to client. Email address likely at fault.")


def send_notification_to_client(mailer, website_json):
    receiver = os.environ["EMAIL_RECEIVER"]
    client_email = website_json["email"]
    client_name = website_json["name"]

    # Create auto-reply to confirm that client's message did send
    # Will try to send html first; send text if not possible
    pref_message = ''
    if website_json["pref_contact"] == 'both':
        pref_message = 'by phone call and/or email'
    elif website_json["pref_contact"] == 'phone':
        pref_message = 'by phone call'
    else:
        pref_message = 'by email'

    reply = MIMEMultipart("mixed")
    reply["Subject"] = "MFP Got Your Message!"
    reply["From"] = f"Mims Painting<{receiver}>"
    reply["Reply-To"] = receiver
    reply["To"] = f"{client_name}<{client_email}>"

    reply_alt = MIMEMultipart('alternative')

    text = f'Hi {client_name},\n\n \
        Thank you for contacting us at Mims Family Painting. We will review\
        your message and reply to you within 2 business days (Monday - Friday) {pref_message}.\n\n \
        We look forward to speaking with you soon.\n\n \
        Best regards,\n \
        Mims Family Painting'

    reply_alt.attach(MIMEText(text, "plain"))

    image_cid = email.utils.make_msgid(domain='mimspainting.com')[1:-1]
    reply_rel = MIMEMultipart('related')
    html = """\
    <html>
        <div
          style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
          border: 20px solid black;
          box-sizing: border-box;
          max-width: 680px;
          min-width: 375px;
          margin: 0 auto;
          color: black;
        ">
          <div style="padding: 2.5rem; background: #faf8f4; box-sizing: border-box; width: 100%; margin-bottom: 2rem;">
            <div style="width: 80%;\
                    display: block;
                    margin: auto;\
                    box-sizing: border-box;
                ">
                <img style="background: rgba(141, 141, 141, 0.5);\
                    border: black solid 4px;\
                    padding: 8px;
                "
                src="cid:{img}"
                alt="Mims Family Painting"
                />
            </div>
            <p style="margin: 0 0 1.25rem 0;">Hi {name},</p>
            <p style="margin: 0 0 1.25rem 0;">Thank you for contacting us at Mims Family Painting. We will review your message and reply to you within 2 business days (Monday - Friday) {pref_message}.
            </p>
            <p style="margin: 0 0 1.25rem 0;">We look forward to speaking with you soon.</p>
            <p style="margin: 0 0 1.25rem 0;">Best regards,</p>
            <p style="margin: 0;">Mims Family Painting</p>
          </div>
        </div>
    </html>
    """.format(name=client_name, pref_message=pref_message, img=image_cid)

    reply_rel.attach(MIMEText(html, "html"))

    with open(os.getcwd() + '/client/public/assets/img/NEWNEWLOGO.png', 'rb') as img:
        maintype, subtype = mimetypes.guess_type(img.name)
        img = MIMEImage(img.read(), subtype, cid=image_cid)
        img.add_header('Content-ID', f'<{image_cid}>')
        reply_rel.attach(img)

    reply_alt.attach(reply_rel)
    reply.attach(reply_alt)

    raw_string = base64.urlsafe_b64encode(
        reply.as_string().encode()).decode()

    try:
        mailer.users().messages().send(
            userId='me', body={'raw': raw_string}).execute()

        return 200
    except Exception as e:
        raise RuntimeError(
            "Failed to send email to client. Email address likely at fault.")


@email_service.route('/submit-form', methods=["POST"])
def send_email():

    # Get form data
    data = request.get_json() or request.form

    CLIENT_SECRET_FILE = os.environ["CLIENT_SECRETS"]
    API_NAME = os.environ["API_NAME"]
    API_VERSION = os.environ["API_VERSION"]
    SCOPES = ['https://mail.google.com/']

    service = Create_Service(CLIENT_SECRET_FILE, API_NAME, API_VERSION, SCOPES)

    try:
        send_website_msg_to_business(service, data)
        send_notification_to_client(service, data)
        return json.dumps({
            'message': 'Success!'
        })
    except Exception as e:
        return json.dumps({
            'error': e,
            'message': f"Oops! Something went wrong. Click below to try again, \
                or contact us directly @ {os.environ['EMAIL_RECEIVER']} from your email client."
        })
