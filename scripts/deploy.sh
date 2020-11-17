docker rmi registry.heroku.com/mimsweb/web
docker build -t registry.heroku.com/mimsweb/web --target prod .
docker push registry.heroku.com/mimsweb/web
