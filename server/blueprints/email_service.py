from flask import Blueprint, request
import json
import email.utils
import mimetypes
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import base64

from flask.helpers import make_response
from flask.json import jsonify
from server.blueprints import Create_Service
from server.limiter import limiter


email_service = Blueprint('emailer', __name__, template_folder='../templates')


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
    <table style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
        font-size: 16px;
        border-collapse: separate;
        border-spacing: 0 1em; 
        max-width: 680px;
        min-width: 375px;
        border: 20px solid black;
        padding: 16px;"> 
    <tbody style="
            font-size: 16px;
            box-sizing: border-box;
            margin: 0px auto;
            color: black;">
        <tr>
        <td>
        <table>
          <tbody>
            <td style="width: 25%;"></td>
            <td style="width: 50%;">
              <img style="background: rgba(141, 141, 141, 0.5);
                              border: black solid 4px;
                              padding: 8px;
                              box-sizing: border-box;
                              display: block;
                              width: 100%;
                             " src="cid:{img}" alt="Mims Family Painting" />
            </td>
            <td style="width: 25%;"></td>
          </tbody>
        </table>
     </td>
        </tr>
        <tr>
        <td>
            <p>Hi {name},</p>
        </td>
        </tr>
        <tr>
        <td>
            <p>
            Thank you for contacting us at Mims Family Painting. 
            We will review your message and reply to you within 2 business days (Monday - Friday) by phone and/or email.
            </p>
        </td>
        </tr>
        <tr>
        <td>
            <p>We look forward to speaking with you soon.</p>
        </td>
        </tr>
        <tr>
        <td>
            <p>Best regards,</p>
            <p>Mims Family Painting</p>
        </td>
        </tr>
    </tbody>
    </table>
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


@email_service.errorhandler(429)
def handle_excess_submits(e):
    return make_response(
        jsonify(
            Error="Too Many Requests",
            message="For security reasons, you may not submit this form again today. Follow up on your inquiry from your email client by emailing us at mims@mimspainting.com."
        ), 429
    )


@email_service.route('/submit-form', methods=["POST"])
@limiter.limit(
    '2 per day',
    deduct_when=lambda response: response.status_code == 200,
    error_message="For security reasons, you may not submit this form again today. Follow up on your inquiry from your email client by emailing us at mims@mimspainting.com."
)
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
