from flask import Flask
from flask_cors import CORS
from decouple import config


app = Flask(__name__, template_folder="../static", static_folder="../static")
app.secret_key = config("SECRET_APP")
CORS(app)

from .routes import *

if __name__ == "__main__":
    app.run()
