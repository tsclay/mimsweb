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

img_files = ["/static/assets/uploads/1925new.jpg",
             "/static/assets/uploads/inside.jpg",
             "/static/assets/uploads/rebarnes.jpg",
             "/static/assets/uploads/rebarnes3.jpg",
             "/static/assets/uploads/rekean2.jpg",
             "/static/assets/uploads/reparish1.jpg",
             "/static/assets/uploads/barnes3.jpg",
             "/static/assets/uploads/parrish2.jpg",
             "/static/assets/uploads/rebarnes1.jpg",
             "/static/assets/uploads/rekean1.jpg",
             "/static/assets/uploads/rekean3.jpg"]

img_names = ["1925new",
             "inside",
             "rebarnes",
             "rebarnes3",
             "rekean2",
             "reparish1",
             "parrish2",
             "rebarnes1",
             "rekean1",
             "rekean3"]

# image1 = Image(image_link="/static/assets/image1.jpg",
#                image_name="waterfall")

# image2 = Image(image_link="/static/assets/image2.jpg",
#                image_name="mountain")
# image3 = Image(image_link="/static/assets/github-round.png",
#                image_name="github")
# seed.extend([image1, image2, image3])

for i in range(len(img_files)):
    seed.append(Image(image_link=img_files[i], image_name=img_names[i]))

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
              customer relations, and exceptional service in the painting industry.\n\
              We serve Nassau and Suffolk Counties on Long Island, Westchester County,\
              and New York City, and we're proud to be one of the largest\
              long-established high-quality painting companies in New York.",
              "More than 75 well-trained, experienced painters will be at your disposal,\
              24 hours a day, 365 days a year. Same day emergency service is available,\
              as needed.\n\
              Our company works closely with builders, architects, designers, and\
              homeowners to ensure they will get a well run, quality paint job.",
              "Our residential repaint work caters to a wide spectrum of homes, from\
              mansions to cottages. All projects undertaken are family run with utmost\
              efficiency, and care is taken to accommodate any given environment.\n\
              Our commercial work experience includes banks, office buildings,\
              restaurants, nursing homes, lighthouses and retail stores.",
              "Our pricing is competitive with other quality contractors but we will work\
              with you on budget limitations as needed. We offer a variety of payment\
              options to accommodate your budget, as well as zero interest payment\
              plans."]

for i in range(4):
    header = Header(header_text=headers[i])
    para = Paragraph(paragraph_text=paragraphs[i])
    header.h_image = seed[0]
    header.h_paragraph = para
    seed.append(header)
    seed.append(para)


@cli.command('create_db')
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


@cli.command('seed_db')
def seed_db():
    db.session.add(Admin(first_name='Tim', last_name='Clay',
                         username="tclay", password="trees", role="admin"))
    db.session.add(Admin(first_name="John", last_name="Smith",
                         username='jsmith', password='apples', role='admin'))
    db.session.add_all(seed)

    db.session.commit()


if __name__ == "__main__":
    cli()
