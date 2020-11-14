echo "One-shot Container"
echo -e "IMAGE - Type the image name to run a container from: "
read image
echo -e "CONTAINER - Give it a name: "
read container
echo -e "PORT - This will be the port to use on your machine: "
read port
echo -e "🐳 Listening @ http://localhost:$port 🐳"
docker run -p $port:3000 --rm --name $container $image