echo -e "PORT: "
read PORT
echo "============== Starting Flask Dev Container =============="
echo "Access Docker container app @ http://0.0.0.0:$PORT"
docker run -p $PORT:3000 --rm -v $(PWD):/code flask:dev