#!/bin/bash
: ${1?"Pass in 'up' to build and run docker-compose-dev or 'down' to close it"}
method="$1"

if [[ "$method" == "up" ]]; then
  echo '🐳 Starting Dev!🐳'
  docker-compose -f docker-compose.dev.yml build
  docker-compose -f docker-compose.dev.yml up
fi

if [[ "$method" == "down" ]]; then
  echo 'Shutting down Dev...'
  docker-compose -f docker-compose.dev.yml down
fi

if [[ "$method" == "db" ]]; then
  echo 'Creating db shell instance...'
  docker-compose -f docker-compose.dev.yml exec db psql -d postgresql://dev:snakes@db:5432/flask-app
fi
