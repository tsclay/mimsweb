from flask import json, request, Blueprint, render_template, session, redirect, url_for

client = Blueprint('client', __name__, template_folder='../../client/public', static_folder='static', static_url_path='../../client/public/static'
                   )


@client.route('', methods=["GET"])
def show_page():
    return render_template('index.html')


# @client.route('/*', methods=["GET"])
# def deliver_resources():
