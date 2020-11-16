#!/bin/bash
: ${1?"Pass in 'up' to build and run docker-compose-prod or 'down' to close it"}
method="$1"

if [[ "$method" == "up" ]]; then
  echo '🐳 Starting Production!🐳'
  docker-compose -f docker-compose.prod.yml build
  docker-compose -f docker-compose.prod.yml up
fi

if [[ "$method" == "down" ]]; then
  echo 'Shutting down Prod...'
  docker-compose -f docker-compose.prod.yml down
fi
