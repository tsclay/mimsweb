from flask import request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os


# def get_remote_address_fix():
# trusted_proxies = {'172.22.0.1'}  # define your own set
# route = request.access_route + [request.remote_addr]
# print("here is the route", route)
# remote_addr = next((addr for addr in reversed(route)
#                     if addr not in trusted_proxies), request.remote_addr)
# remote_addr = request.headers['X-Real-IP']

# return remote_addr


limiter = Limiter(key_func=get_remote_address,
                  default_limits=["300 per day", "100 per hour"],
                  storage_uri=os.environ["REDIS_URI"])

# default_limits=["200 per day", "50 per hour"]
