from flask import Flask, send_from_directory
import os


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
    from server.blueprints.galleries import galleries

    server.register_blueprint(auth, url_prefix="/admin")
    server.register_blueprint(images, url_prefix='/admin/assets')
    server.register_blueprint(content, url_prefix='/admin/content')
    server.register_blueprint(galleries, url_prefix='/admin/galleries')
    server.register_blueprint(blacklist, url_prefix='/admin/blacklist')
    server.register_blueprint(settings)
    server.register_blueprint(email_service)

    @server.route('/', methods=["GET"])
    def home():
        return send_from_directory('../client/public', 'index.html')

    @server.route("/<path:path>")
    def send_assets(path):
        return send_from_directory('../client/public', path)

    return server
