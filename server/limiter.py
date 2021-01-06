from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

limiter = Limiter(key_func=get_remote_address,
                  default_limits=["200 per day", "50 per hour"],
                  storage_uri=os.environ["REDIS_URI"])

# default_limits=["200 per day", "50 per hour"]
