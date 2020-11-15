#!/bin/sh

echo "📦 Installing NPM packages 📦"
cd client && npm i
cd ../server/static/js && npm i

cd ../../
echo "🐍 Setting Python venv & installing pkgs 🐍"
python3 -m venv ./venv
cd ../
pip3 install --upgrade pip
pip3 install -r requirements.txt
