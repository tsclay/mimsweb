from flask.cli import FlaskGroup
import server
from server.db import db
from server.models.Admin import Admin
from server.models.Header import Header
from server.models.Image import Image
from server.models.Paragraph import Paragraph
from server.models.Gallery_Info import Gallery_Info
from server.models.Galleries import Galleries
from server.models.Role import Role

cli = FlaskGroup(server)

seed = []

img_files = [
    {"name": "1925new", "path": "/static/assets/uploads/1925new.jpg"},
    {"name": "rebarnes", "path": "/static/assets/uploads/rebarnes.jpg"},
    {"name": "rekean2", "path": "/static/assets/uploads/rekean2.jpg"},
    {"name": "reparish1", "path": "/static/assets/uploads/reparish1.jpg"},
    {"name": "rebarnes1", "path": "/static/assets/uploads/rebarnes1.jpg"},
    {"name": "rekean1", "path": "/static/assets/uploads/rekean1.jpg"},
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


for i in range(len(img_files)):
    seed.append(
        Image(image_link=img_files[i]["path"], image_name=img_files[i]["name"]))

curator = Role(role_name="curator", permissions=[
               "create/read/update/delete image", "read/update gallery", "read content"])
writer = Role(role_name="writer", permissions=[
              "create/read/update/delete content", "read gallery", "read image"])
manager = Role(role_name="manager", permissions=[
               "create/read/update/delete image", "create/read/update/delete content", "create/read/update/update gallery", "create/read/update/delete blacklist"])
admin = Role(role_name="admin", permissions=["create/read/update/delete image", "create/read/update/delete content",
                                             "create/read/update/update gallery", "create/read/update/delete blacklist", "create/read/update/delete admin"])
seed.extend([curator, writer, manager, admin])

headers = ['Five generations of excellence',
           'Fully licensed, insured, bonded, and certified',
           'Serving Residential & Commercial',
           'Competitive, flexible pricing']

paragraphs = ["We are built on six generations of highly-skilled workmanship, outstanding\
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

for i in range(4):
    header = Header(header_text=headers[i])
    para = Paragraph(paragraph_text=paragraphs[i])
    linked_img = Image(
        image_link=paired_image_files[i]["path"], image_name=paired_image_files[i]["name"])
    header.h_image = linked_img
    header.h_paragraph = para
    seed.append(header)
    seed.append(para)
    seed.append(linked_img)


@ cli.command('create_db')
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


@ cli.command('seed_db')
def seed_db():
    db.session.add(Admin(first_name='Tim', last_name='Clay',
                         username="tclay", password="trees", role="admin"))
    db.session.add(Admin(first_name="John", last_name="Smith",
                         username='jsmith', password='apples', role='admin'))
    db.session.add_all(seed)

    db.session.commit()


if __name__ == "__main__":
    cli()
