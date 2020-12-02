# Base image for Flask app
# Any further stages are based on this
FROM python:3.8-slim-buster AS base
WORKDIR /code
RUN apt-get update || : && apt-get install -y gcc musl-dev netcat curl gnupg
RUN curl --silent https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
RUN echo "deb https://deb.nodesource.com/node_14.x buster main\ndeb-src https://deb.nodesource.com/node_14.x buster main" > /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN curl -sL https://deb.nodesource.com/node_14.x | apt-get install -y nodejs
RUN pip install --upgrade pip
# COPY requirements.txt requirements.txt
COPY . .
RUN pip install -r requirements.txt

# Production image using Gunicorn
FROM base AS prod
ENV FLASK_ENV=production
EXPOSE 4001
ENTRYPOINT [ "/code/scripts/entrypoint.sh" ]

# Dev image using 'flask run' to leverage helpful error msgs and 
# reloading
FROM base AS dev
ENV FLASK_ENV=development
EXPOSE 3000
ENTRYPOINT [ "/code/scripts/entrypoint.sh" ]

# Production image using Gunicorn
FROM base AS stage
ENV FLASK_APP=./server
ENV FLASK_ENV=staging
ENV FLASK_RUN_HOST=0.0.0.0
ENV PORT=5000
ENV SECRET_KEY=FeedMeSeymour
ENV DATABASE=postgres
ENV SQL_PORT=5432
ENV SQL_HOST=elephant.cjjk1fur9ng2.us-west-2.rds.amazonaws.com
ENV DATABASE_URL=postgresql://tester:password@elephant.cjjk1fur9ng2.us-west-2.rds.amazonaws.com:5432/test
ENV APP_SETTINGS=config.Config
EXPOSE 5000
ENTRYPOINT [ "/code/scripts/entrypoint.sh" ]



# docker exec -it 66fcac09ed66 psql -d postgresql://dev:snakes@db:5432/flask-app

