# MFP Website & Content Portal

New and improved website for Mims Family Painting.

## Development Environment

### Requirements

- Docker
- Docker-compose

Docker-compose if used to orchestrate dev containers for the flask server, the Svelte server, and the PostgreSQL server.

Start up docker-compose for dev environment. Do this from project root.

```bash
bash scripts/dev-compose.sh up
```

To terminate docker-compose gracefully and unmount volumes

```bash
bash scripts/dev-compose.sh down
```

### Setup

Following needed if developing outside Docker

- Python 3.8
- Node.js 14
- npm:latest

If the above are met, run install script

```bash
# Execute in project root
bash scripts/install.sh
```

## Project Navigation

### Front-end

Front-end website created with Svelte framework.

Located in `/client`

### Back-end

managem used for content-management.

- Routing: `server/blueprints`
- Templates/Views: `server/templates`
- CSS: `server/static/css`
- JS: `server/static/js`
- Database schemas: `server/models`
- Emailing manager: `server/blueprints/email_service.py`

## References for Installing Node.js on top of Python image

Why? Any front-end scaffolding that needs a bundling manager (Webpack, Rollup, etc.) needs Node.js. Otherwise, one could bundle the front-end manually before spinning up Docker in production.

### Getting gpg.key for nodesource

Without the right gpg.key, image will **not** allow downloads from the Node.js repo. Image needs `gnupg` and `curl`
https://github.com/nodesource/distributions/issues/541
https://github.com/FreeWaveTechnologies/ZumIQ/issues/8

```Dockerfile
RUN apt-get update || : && apt-get install -y gcc musl-dev netcat curl gnupg
RUN curl --silent https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
```

### Pointing to right repo

Make `/etc/apt/sources.list.d/nodesource.list` with specified version of Node.js binary to fetch and install
https://github.com/nodejs/help/issues/1040

```Dockerfile
RUN echo "deb https://deb.nodesource.com/node_14.x buster main\ndeb-src https://deb.nodesource.com/node_14.x buster main" > /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN curl -sL https://deb.nodesource.com/node_14.x | apt-get install -y nodejs
```

### Differences from Nodesource

The commands listed at the [nodesource repo](https://github.com/nodesource/distributions) don't quite work as written in Docker.

From repo:

```bash
# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_14.x | bash -
apt-get install -y nodejs
```

Used in `Dockerfile`:

```bash
curl -sL https://deb.nodesource.com/node_14.x | apt-get install -y nodejs
```

## SQL notes

### To get from content and galleries all that are linked in client_resources

```sql
SELECT clients.resource_id, headers.header_text, clients.content_id, paragraphs.paragraph_text, images.image_name, images.image_link, clients.gallery_id, gallery_info.gallery_name, gallery_info.description, galleries.index_id FROM client_resources as clients
LEFT OUTER JOIN headers ON headers.header_id = clients.content_id
LEFT OUTER JOIN galleries ON galleries.info_id = clients.gallery_id
LEFT OUTER JOIN paragraphs ON paragraphs.paragraph_id = headers.paragraph_id
LEFT OUTER JOIN images ON images.image_id = headers.image_id OR images.image_id = galleries.image_id
LEFT OUTER JOIN gallery_info ON galleries.info_id = gallery_info.gallery_id
ORDER BY clients.content_id, clients.gallery_id, galleries.index_id, clients.resource_id;
```

### To get from content (headers, paragraphs, images) and gallery_info only those that are linked in client_resources

```sql
SELECT clients.id, headers.header_text, paragraphs.paragraph_text, images.image_name, images.image_link, gallery_info.gallery_name, gallery_info.description FROM client_resources as clients
LEFT OUTER JOIN headers ON headers.id = clients.content_id
LEFT OUTER JOIN paragraphs ON paragraphs.id = headers.paragraph_id
LEFT OUTER JOIN images on images.id = headers.image_id
LEFT OUTER JOIN gallery_info ON gallery_info.id = clients.gallery_id
ORDER BY clients.content_id, clients.id;
```

### To get from galleries table only those that are linked in client_resources:

For the client, who should only ask for and receive the resources registered as being on the site

```sql
SELECT clients.id, gallery_info.*, images.* FROM galleries
LEFT OUTER JOIN gallery_info ON gallery_info.id = galleries.info_id
INNER JOIN client_resources as clients ON clients.gallery_id = gallery_info.id
LEFT OUTER JOIN images ON images.id = galleries.image_id
ORDER BY galleries.id;
```

### To get all from galleries and show client_resources.id

For use in the managem portal at `/galleries`, secured by checking for session on server

```sql
SELECT c.resource_id, g.gallery_name, g.description, g.gallery_id, gal.image_id, i.image_name, i.image_link, gal.info_id, gal.index_id FROM galleries gal
    LEFT OUTER JOIN client_resources c ON gal.info_id = c.gallery_id
    LEFT OUTER JOIN gallery_info g ON g.gallery_id = gal.info_id
    LEFT OUTER JOIN images i ON i.image_id = gal.image_id
    ORDER BY c.gallery_id, gal.index_id;
```
