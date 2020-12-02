#!/bin/sh

if [ nc -z $DATABASE ] && [ "$DATABASE" = "postgres" ]; then
  echo "Waiting for postgres..."

  while ! nc -z $SQL_HOST $SQL_PORT; do
    sleep 0.1
  done

  echo "🐘 PostgreSQL started 🐘"
fi

if [ "$FLASK_ENV" = "development" ]; then
  echo "🏞 Loading .env 🏞"
  set -a
  source .dev.env
  python manage.py create_db
  echo "💻  Dev database created! 💻"
  python manage.py seed_db
  echo "🌱 Database seeded 🌱"
  flask run
fi

if [ "$FLASK_ENV" = "staging" ]; then
  echo "📦 Installing NPM packages 📦"
  cd client && npm i
  npm run build
  echo "🚀 Svelte app bundled 🚀"
  cd ..
  sleep 0.1
  python manage.py create_db
  echo "💻  Dev database created! 💻"
  python manage.py seed_db
  echo "🌱 Database seeded 🌱"
  echo "🔐 Set non-root user & Change ownership 🔐"
  groupadd -r mims && useradd -r -g mims mims
  chown -R mims ./
  echo "✅ Non-root user set! ✅"
  gunicorn -b $FLASK_RUN_HOST:$PORT 'server:create_app()'
fi

if [ "$FLASK_ENV" = "production" ]; then
  echo "🏞 Loading .env 🏞"
  set -a
  source .prod.env
  echo "📦 Installing NPM packages 📦"
  cd client && npm i
  npm run build
  echo "🚀 Svelte app bundled 🚀"
  cd ..
  sleep 0.1
  python manage.py create_db
  echo "💻  Dev database created! 💻"
  python manage.py seed_db
  echo "🌱 Database seeded 🌱"
  gunicorn -b 0.0.0.0:$PORT 'server:create_app()'
fi

exec "$@"
