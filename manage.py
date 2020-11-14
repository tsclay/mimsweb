from flask.cli import FlaskGroup
import server
from server.db import db
from server.models.Admin import Admin
from server.models.Header import Header
from server.models.Image import Image
from server.models.Paragraph import Paragraph

cli = FlaskGroup(server)

seed = []

image = Image(image_link="/static/assets/image1.jpg",
              image_name="waterfall")
seed.append(image)
for i in range(10):
    header = Header(header_text=f'This is header #{i}')
    para = Paragraph(paragraph_text=f'A paragraph for header #{i}')
    header.h_image = image
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
