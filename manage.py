from server.blueprints import encrypt_credentials
from flask.cli import FlaskGroup
import server
from server.db import db
from server.models.Admin import Admin
from server.models.Header import Header
from server.models.Image import Image
from server.models.Paragraph import Paragraph
from server.models.Gallery_Info import Gallery_Info
from server.models.Galleries import Galleries
from server.models.Client_Resources import Client_Resources
from server.models.Role import Role
# import base64
# import os
# from cryptography.fernet import Fernet
# from cryptography.hazmat.primitives import hashes
# from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

cli = FlaskGroup(server)


# def hash_password(user_cred):
#     secret = os.environ["SECRET_KEY"]
#     password = bytes(secret, "utf-8")
#     salt = b"saltysaltysalt"
#     kdf = PBKDF2HMAC(
#         algorithm=hashes.SHA256(),
#         length=32,
#         salt=salt,
#         iterations=100000,
#     )
#     key = base64.urlsafe_b64encode(kdf.derive(password))
#     f = Fernet(key)
#     str_to_encrypt = bytes(f"{user_cred}", "utf-8")
#     encrypted_str = f.encrypt(str_to_encrypt).decode("utf-8")
#     return encrypted_str


seed = []

testimonial_files = [
    {"name": "testimonial2014-02-27-at-9-14-30-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-14-30-am.png"},
    {"name": "testimonial2014-03-04-at-12-43-00-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-43-00-pm.png"},
    {"name": "testimonial2014-02-27-at-9-16-21-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-16-21-am.png"},
    {"name": "testimonial2014-03-04-at-12-44-51-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-44-51-pm.png"},
    {"name": "testimonial2014-02-27-at-9-18-24-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-18-24-am.png"},
    {"name": "testimonial2014-03-04-at-12-45-19-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-45-19-pm.png"},
    {"name": "testimonial2014-02-27-at-9-19-30-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-19-30-am.png"},
    {"name": "testimonial2014-03-04-at-12-46-33-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-46-33-pm.png"},
    {"name": "testimonial2014-02-27-at-9-20-49-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-20-49-am.png"},
    {"name": "testimonial2014-03-04-at-12-46-50-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-46-50-pm.png"},
    {"name": "testimonial2014-02-27-at-9-21-54-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-21-54-am.png"},
    {"name": "testimonial2014-03-04-at-12-47-01-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-47-01-pm.png"},
    {"name": "testimonial2014-02-27-at-9-22-55-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-22-55-am.png"},
    {"name": "testimonial2014-03-04-at-12-49-50-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-49-50-pm.png"},
    {"name": "testimonial2014-02-27-at-9-24-01-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-24-01-am.png"},
    {"name": "testimonial2014-03-04-at-12-50-17-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-50-17-pm.png"},
    {"name": "testimonial2014-02-27-at-9-26-25-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-26-25-am.png"},
    {"name": "testimonial2014-03-04-at-12-50-58-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-50-58-pm.png"},
    {"name": "testimonial2014-02-27-at-9-27-30-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-27-30-am.png"},
    {"name": "testimonial2014-03-04-at-12-51-30-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-51-30-pm.png"},
    {"name": "testimonial2014-02-27-at-9-28-45-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-28-45-am.png"},
    {"name": "testimonial2014-03-04-at-12-51-52-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-51-52-pm.png"},
    {"name": "testimonial2014-02-27-at-9-29-43-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-29-43-am.png"},
    {"name": "testimonial2014-03-04-at-12-55-08-pm",
        "path": "/static/assets/uploads/testimonial2014-03-04-at-12-55-08-pm.png"},
    {"name": "testimonial2014-02-27-at-9-31-08-am",
        "path": "/static/assets/uploads/testimonial2014-02-27-at-9-31-08-am.png"}
]

art_files = [{"name": "rebarnes", "path": "/static/assets/uploads/rebarnes.jpg"},
             {"name": "rekean2", "path": "/static/assets/uploads/rekean2.jpg"},
             {"name": "reparish1", "path": "/static/assets/uploads/reparish1.jpg"},
             {"name": "rebarnes1", "path": "/static/assets/uploads/rebarnes1.jpg"},
             {"name": "rekean1", "path": "/static/assets/uploads/rekean1.jpg"}]

roles = [
    {"name": "curator", "permissions": [
        "create/read/update/delete image", "read/update gallery", "read content"]},
    {"name": "writer", "permissions": [
        "create/read/update/delete content", "read gallery", "read image"]},
    {"name": "manager", "permissions": ["create/read/update/delete image", "create/read/update/delete content",
                                        "create/read/update/update gallery", "create/read/update/delete blacklist", "create/read admin"]},
    {"name": "admin", "permissions": ["create/read/update/delete image", "create/read/update/delete content",
                                      "create/read/update/update gallery", "create/read/update/delete blacklist", "create/read/update/delete admin"]}
]

headers = ['Five generations of excellence',
           'Fully licensed, insured, bonded, and certified',
           'Serving Residential & Commercial',
           'Competitive, flexible pricing']

paragraphs = ["We are built on five generations of highly-skilled workmanship, outstanding\
              customer relations, and exceptional service in the painting industry.\n\n\
              We serve Nassau and Suffolk Counties on Long Island, Westchester County,\
              and New York City, and we're proud to be one of the largest\
              long-established high-quality painting companies in New York.",
              "More than 75 well-trained, experienced painters will be at your disposal,\
              24 hours a day, 365 days a year. Same day emergency service is available,\
              as needed.\n\n\
              Our company works closely with builders, architects, designers, and\
              homeowners to ensure they will get a well run, quality paint job.",
              "Our residential repaint work caters to a wide spectrum of homes, from\
              mansions to cottages. All projects undertaken are family run with utmost\
              efficiency, and care is taken to accommodate any given environment.\n\n\
              Our commercial work experience includes banks, office buildings,\
              restaurants, nursing homes, lighthouses and retail stores.",
              "Our pricing is competitive with other quality contractors but we will work\
              with you on budget limitations as needed.\n\nWe offer a variety of payment\
              options to accommodate your budget, as well as zero interest payment\
              plans."]

paired_image_files = [{"name": "inside", "path": "/static/assets/uploads/inside.jpg"},
                      {"name": "rebarnes3",
                          "path": "/static/assets/uploads/rebarnes3.jpg"},
                      {"name": "parrish2", "path": "/static/assets/uploads/parrish2.jpg"},
                      {"name": "rekean3", "path": "/static/assets/uploads/rekean3.jpg"}]

# Handle portfolio images & gallery
art_gallery_info = Gallery_Info(
    gallery_name="See our work", description="Check out our gallery below!", last_updated=None, last_updated_by=None)

seed.append(art_gallery_info)
seed.append(
    Image(image_link="/static/assets/uploads/1925new.jpg", image_name="1925new"))

for_client = Client_Resources()
for_client.linked_gallery = art_gallery_info
seed.append(for_client)

for role in roles:
    seed.append(Role(role_name=role["name"], permissions=role["permissions"]))

for i in range(4):
    header = Header(header_text=headers[i])
    para = Paragraph(paragraph_text=paragraphs[i])
    linked_img = Image(
        image_link=paired_image_files[i]["path"], image_name=paired_image_files[i]["name"])
    header.h_image = linked_img
    header.h_paragraph = para
    new_gallery = Galleries()
    new_gallery.gallery_image = linked_img
    new_gallery.gallery_info = art_gallery_info
    for_client = Client_Resources()
    for_client.linked_content = header
    seed.extend([header, para, linked_img, new_gallery, for_client])

for i in range(len(art_files)):
    image = Image(
        image_link=art_files[i]["path"], image_name=art_files[i]["name"])
    new_gallery = Galleries()
    new_gallery.gallery_info = art_gallery_info
    new_gallery.gallery_image = image
    seed.extend([image, new_gallery])

# Handle testimonials & gallery
testimonial_gallery_info = Gallery_Info(
    gallery_name="Recognized in the community", description="Many of our clients and collaborators have expressed their gratitude for our hard work. Check them out below!", last_updated=None, last_updated_by=None)

for_client = Client_Resources()
for_client.linked_gallery = testimonial_gallery_info
seed.append(for_client)

for i in range(len(testimonial_files)):
    image = Image(
        image_link=testimonial_files[i]["path"], image_name=testimonial_files[i]["name"])
    new_gallery = Galleries()
    new_gallery.gallery_info = testimonial_gallery_info
    new_gallery.gallery_image = image
    seed.extend([image, new_gallery])


@ cli.command('create_db')
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


@ cli.command('seed_db')
def seed_db():
    db.session.add(Admin(first_name="John", last_name="Smith", email='jsmith@example.com',
                         username='jsmith', password=encrypt_credentials('apples'), role='admin', recovery_link=None, last_logged_in=None))
    db.session.add(Admin(first_name="Jane", last_name="Doe", email='jdoe@example.com',
                         username='jdoe', password=encrypt_credentials('apples'), role='curator', recovery_link=None, last_logged_in=None))
    db.session.add(Admin(first_name="Bruce", last_name="Wayne", email='bwayne@example.com',
                         username='bwayne', password=encrypt_credentials('batman'), role='manager', recovery_link=None, last_logged_in=None))
    db.session.add_all(seed)

    db.session.commit()


if __name__ == "__main__":
    cli()
