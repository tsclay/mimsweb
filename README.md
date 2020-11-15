# MFP Website & Content Portal

New and improved website for Mims Family Painting.

## Setup

Install dependencies

```bash
bash scripts/install.sh
```

## Development Environment

Development depends on docker and docker-compose. Both should be installed.

Docker-compose if used to orchestrate dev containers for the flask server, the Svelte server, and the PostgreSQL server.

Start up docker-compose for dev environment. Do this from project root.

```bash
bash scripts/dev-compose.sh up
```

To terminate docker-compose gracefully and unmount volumes

```bash
bash scripts/dev-compose.sh down
```

### Front-end

Docker-compose creates a container called `client`, which is running `npm run dev` for Svelte.

Any changes made in Svelte files will be rendered on page refresh.

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
