#! bin bash
docker build -t flask:base --target base .
docker build -t flask:dev --target dev .
bash scripts/start_dev.sh
