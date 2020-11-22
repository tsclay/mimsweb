from flask.cli import FlaskGroup
import server
from server.db import db
from server.models.Admin import Admin
from server.models.Header import Header
from server.models.Image import Image
from server.models.Paragraph import Paragraph
from server.models.Gallery import Gallery
from server.models.Role import Role

cli = FlaskGroup(server)

seed = []

image1 = Image(image_link="/static/assets/image1.jpg",
               image_name="waterfall")

image2 = Image(image_link="/static/assets/image2.jpg",
               image_name="mountain")
image3 = Image(image_link="/static/assets/github-round.png",
               image_name="github")
seed.extend([image1, image2, image3])

curator = Role(role_name="curator", permissions=[
               "create/read/update/delete image", "read/update gallery", "read content"])
writer = Role(role_name="writer", permissions=[
              "create/read/update/delete content", "read gallery", "read image"])
manager = Role(role_name="manager", permissions=[
               "create/read/update/delete image", "create/read/update/delete content", "create/read/update/update gallery", "create/read/update/delete blacklist"])
admin = Role(role_name="admin", permissions=["create/read/update/delete image", "create/read/update/delete content",
                                             "create/read/update/update gallery", "create/read/update/delete blacklist", "create/read/update/delete admin"])
seed.extend([curator, writer, manager, admin])

for i in range(10):
    header = Header(header_text=f'This is header #{i}')
    para = Paragraph(paragraph_text=f'A paragraph for header #{i}')
    header.h_image = image1
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
