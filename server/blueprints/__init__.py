import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from flask import current_app


def encrypt_credentials(user_cred):
    secret = current_app.config["SECRET_KEY"]
    password = bytes(secret, "utf-8")
    salt = bytes(os.environ["SALT"], 'utf-8')
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))
    f = Fernet(key)
    str_to_encrypt = bytes(user_cred, "utf-8")
    encrypted_str = f.encrypt(str_to_encrypt).decode("utf-8")
    return encrypted_str


def decrypt(user_cred):
    secret = current_app.config["SECRET_KEY"]
    password = bytes(secret, "utf-8")
    salt = bytes(os.environ["SALT"], 'utf-8')
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))
    f = Fernet(key)
    decrypted_str = f.decrypt(bytes(user_cred, "utf-8")).decode("utf-8")
    return decrypted_str
