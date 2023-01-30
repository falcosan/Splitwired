from flask import Flask
from flask_cors import CORS

app = Flask(__name__, template_folder="../static", static_folder="../static")
CORS(app)

from .routes import *

if __name__ == "__main__":
    app.run()
