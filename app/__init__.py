from flask import Flask
from flask_cors import CORS
from decouple import config


flask_app = Flask(__name__, template_folder="../static", static_folder="../static")
flask_app.secret_key = config("SECRET_APP")
flask_app.json.sort_keys = False
CORS(flask_app)

from app.routes import *

if __name__ == "__main__":
    flask_app.run()
