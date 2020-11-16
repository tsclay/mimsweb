#!/bin/sh

if [ "$DATABASE" = "postgres" ]; then
  echo "Waiting for postgres..."

  while ! nc -z $SQL_HOST $SQL_PORT; do
    sleep 0.1
  done

  echo "🐘 PostgreSQL started 🐘"
fi

if [ "$FLASK_ENV" = "development" ]; then
  python manage.py create_db
  echo "💻  Dev database created! 💻"
  python manage.py seed_db
  echo "🌱 Database seeded 🌱"
  flask run
fi

if [ "$FLASK_ENV" = "production" ]; then
  cd client && npm run build
  echo "🚀 Svelte app bundled 🚀"
  cd ..
  sleep 0.1
  python manage.py create_db
  echo "💻  Dev database created! 💻"
  python manage.py seed_db
  echo "🌱 Database seeded 🌱"
  gunicorn -b $FLASK_RUN_HOST:${FLASK_RUN_PORT} 'server:create_app()'
fi

exec "$@"
