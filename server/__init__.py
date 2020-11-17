from flask import Flask, render_template, url_for, redirect, send_from_directory, request
from flask_sqlalchemy import SQLAlchemy
import json
import os
from werkzeug.utils import secure_filename


def create_app():
    server = Flask(__name__)
    server.config.from_object("server." + os.environ["APP_SETTINGS"])

    from .db import db
    db.init_app(server)

    # Order of imports matter here
    # If placed at the top, these blueprints get no db :(
    from server.blueprints.content import content
    from server.blueprints.auth import auth
    from server.blueprints.images import images
    from server.blueprints.blacklist import blacklist
    from server.blueprints.settings import settings
    from server.blueprints.email_service import email_service

    server.register_blueprint(auth, url_prefix="/admin")
    server.register_blueprint(images, url_prefix='/admin/assets')
    server.register_blueprint(content, url_prefix='/admin/content')
    server.register_blueprint(blacklist, url_prefix='/admin/blacklist')
    server.register_blueprint(settings)
    server.register_blueprint(email_service)

    # @server.before_request
    # def before_request():
    #     if not request.is_secure and os.environ["FLASK_ENV"] != "development":
    #         url = request.url.replace("http://", "https://", 1)
    #         code = 301
    #         return redirect(url, code=code)

    @server.route('/', methods=["GET"])
    def home():
        return send_from_directory('../client/public', 'index.html')

    @server.route("/<path:path>")
    def send_assets(path):
        return send_from_directory('../client/public', path)

    return server
