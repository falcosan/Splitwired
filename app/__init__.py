import logging
from flask_cors import CORS
from decouple import config
from flask import Flask, jsonify


flask_app = Flask(__name__, template_folder="../static", static_folder="../static")
flask_app.secret_key = config("SECRET_APP")
flask_app.json.sort_keys = False
CORS(flask_app)


@flask_app.errorhandler(Exception)
def handle_exception(e):
    logging.exception("Unhandled exception")
    return jsonify(error=str(e)), 500


from app.routes import *

if __name__ == "__main__":
    flask_app.run()
