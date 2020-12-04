#!/bin/sh

echo "📦 Installing NPM packages 📦"
cd client
npm i
cd ../server/static/js
npm i

cd ../../
echo "🐍 Creating Python venv 🐍"
sleep 0.1
python3 -m venv ./venv
echo "🐍 Activating venv 🐍"
. venv/bin/activate
sleep 0.1
cd ../
echo "🐍 Upgrade pip & install requirements 🐍"
pip install --upgrade pip
pip install -r requirements.txt
echo "🚀 Ready to rock. 😎"
