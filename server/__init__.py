from flask import Flask, send_from_directory, url_for, jsonify, render_template, current_app, request
from flask_wtf.csrf import CSRFProtect
from flask_talisman import Talisman
import os
from werkzeug.middleware.proxy_fix import ProxyFix


def create_app():
    server = Flask(__name__, template_folder='../client/public')

    server.wsgi_app = ProxyFix(server.wsgi_app, x_for=1)
    server.config.from_object("server." + os.environ["APP_SETTINGS"])

    from .db import db
    from .limiter import limiter
    csrf = CSRFProtect()
    db.init_app(server)
    csrf.init_app(server)
    limiter.init_app(server)
    Talisman(server, content_security_policy={
        'font-src': ["'self'", 'themes.googleusercontent.com', '*.gstatic.com'],
        'script-src': ["'self'", 'ajax.googleapis.com'],
        'style-src': ["'self'", 'fonts.googleapis.com', '*.gstatic.com', 'ajax.googleapis.com', "'unsafe-inline'", ],
        'default-src':  ["'self'", '*.gstatic.com']
    }, force_https=False)

    from server.models.Client_Resources import Client_Resources
    from server.models.Gallery_Info import Gallery_Info
    from server.models.Image import Image
    from server.models.Paragraph import Paragraph
    from server.models.Galleries import Galleries
    from server.models.Header import Header

    # Order of imports matter here
    # If placed at the top, these blueprints get no db :(
    from server.blueprints.content import content
    from server.blueprints.auth import auth
    from server.blueprints.images import images
    from server.blueprints.blacklist import blacklist
    from server.blueprints.settings import settings
    from server.blueprints.email_service import email_service
    from server.blueprints.gallery import galleries
    from server.blueprints.users import users

    server.register_blueprint(auth, url_prefix="/admin")
    server.register_blueprint(images, url_prefix='/admin/assets')
    server.register_blueprint(content, url_prefix='/content')
    server.register_blueprint(galleries, url_prefix='/galleries')
    server.register_blueprint(blacklist, url_prefix='/admin/blacklist')
    server.register_blueprint(settings)
    server.register_blueprint(email_service)
    server.register_blueprint(users)

# Set custom CSP settings for admin portal, no easier way to do this unfortunately
# https://github.com/GoogleCloudPlatform/flask-talisman/issues/45
    with server.app_context():
        setattr(current_app.view_functions.get("auth.home"), "talisman_view_options", {
                "content_security_policy": {"default-src": "* 'unsafe-inline'"}})
        setattr(current_app.view_functions.get("auth.login"), "talisman_view_options", {
            "content_security_policy": {"default-src": "* 'unsafe-inline'"}})
        setattr(current_app.view_functions.get("images.handle_images"), "talisman_view_options", {
                "content_security_policy": {"default-src": "* 'unsafe-inline'"}})
        setattr(current_app.view_functions.get("content.render"), "talisman_view_options", {
                "content_security_policy": {"default-src": "* 'unsafe-inline'"}})
        setattr(current_app.view_functions.get("galleries.handle_images"), "talisman_view_options", {
                "content_security_policy": {"default-src": "* 'unsafe-inline'"}})
        setattr(current_app.view_functions.get("settings.show_page"), "talisman_view_options", {
                "content_security_policy": {"default-src": "* 'unsafe-inline'"}})
        setattr(current_app.view_functions.get("users.handle_recovery"), "talisman_view_options", {
                "content_security_policy": {"default-src": "* 'unsafe-inline'"}})

    @server.errorhandler(429)
    def handle_excess_req(e):
        message = "You've requested our site quite rapidly recently. Please try again later."
        error = "Too Many Requests"
        return render_template('error.html', message=message, error=error)

    @server.route('/', methods=["GET"])
    @limiter.limit('50/minute')
    def home():
        return render_template('index.html', test=request.headers)

        # return send_from_directory('../client/public', 'index.html')

    @server.route("/<path:path>")
    @limiter.exempt
    def send_assets(path):
        return send_from_directory('../client/public', path)

    @server.route('/resources', methods=['GET'])
    def get_resources():
        """
        ### Deliver only the content and galleries that are in use on the client website

        ```sql
        SELECT clients.resource_id, headers.header_text, clients.content_id, paragraphs.paragraph_text, images.image_name, images.image_link, clients.gallery_id, gallery_info.gallery_name, gallery_info.description, galleries.index_id FROM client_resources as clients 
        LEFT OUTER JOIN headers ON headers.header_id = clients.content_id
        LEFT OUTER JOIN galleries ON galleries.info_id = clients.gallery_id
        LEFT OUTER JOIN paragraphs ON paragraphs.paragraph_id = headers.paragraph_id
        LEFT OUTER JOIN images ON images.image_id = headers.image_id OR images.image_id = galleries.image_id
        LEFT OUTER JOIN gallery_info ON galleries.info_id = gallery_info.gallery_id
        ORDER BY clients.content_id, clients.gallery_id, galleries.index_id, clients.resource_id;
        ```
        """
        resources = Client_Resources.query.with_entities(Client_Resources.resource_id, Client_Resources.content_id, Header.header_text, Paragraph.paragraph_text, Image.image_name, Image.image_link, Client_Resources.gallery_id, Gallery_Info.gallery_name, Gallery_Info.description, Galleries.index_id).outerjoin(Header, Header.header_id == Client_Resources.content_id).outerjoin(
            Galleries, Galleries.info_id == Client_Resources.gallery_id).outerjoin(Paragraph, Paragraph.paragraph_id == Header.paragraph_id).outerjoin(Image, ((Image.image_id == Header.image_id) | (Image.image_id == Galleries.image_id))).outerjoin(Gallery_Info, Gallery_Info.gallery_id == Galleries.info_id).order_by(Client_Resources.content_id, Client_Resources.gallery_id, Galleries.index_id, Client_Resources.resource_id)

        all_galleries = []
        all_content = []

        marker = None
        gallery_json = None

        for row in resources:
            if row.content_id is not None:
                image_name = row.image_name if hasattr(
                    row, "image_name") else 'Placeholder'
                image_link = row.image_link if hasattr(row, "image_link") else url_for(
                    'static', filename='assets/icons/image-icon.inkscape.png')
                item = {
                    "header_text": row.header_text,
                    "paragraph_text": row.paragraph_text,
                    "image_name": image_name,
                    "image_link": image_link
                }
                all_content.append(item)

            if row.gallery_id is not None:
                if marker is None and gallery_json is None:
                    marker = row.gallery_id
                    gallery_json = {"gallery_name": row.gallery_name,
                                    "description": row.description,
                                    "images": []}
                # Change in row.info_id means the current row is part of next gallery
                # Append prev gallery and set up next one, change pointer to new current gallery
                if row.gallery_id != marker:
                    all_galleries.append(gallery_json)
                    gallery_json = {"gallery_name": row.gallery_name,
                                    "description": row.description,
                                    "images": []}
                    marker = row.gallery_id

                image_link = row.image_link
                image_name = row.image_name
                gallery_json['images'].append(
                    {"alt": image_name, "src": image_link})
                # Append the last gallery after adding the last image to it
                if row == resources[-1]:
                    all_galleries.append(gallery_json)

        all_stuff = {"content": all_content,
                     "galleries": all_galleries}

        return jsonify(all_stuff)

    return server
