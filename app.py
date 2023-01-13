from backend.data import expenses
from flask import Flask, render_template, request
from flask.helpers import send_from_directory
from flask_cors import CORS, cross_origin

app = Flask(__name__, template_folder="static", static_url_path="")
CORS(app)


@app.route("/")
@cross_origin()
def index():
    return render_template("index.html")


@app.route("/")
@cross_origin()
def serve():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/expanses", methods=["POST"])
@cross_origin()
def expanses():
    parameter = request.get_json()
    groups = parameter["groups"]
    personal = False
    csv = parameter["csv"]
    month = parameter["month"]
    year = parameter["year"]
    response = expenses(
        groups=groups, personal=personal, csv=csv, month=month, year=year
    )
    return response


if __name__ == "__main__":
    app.run()
