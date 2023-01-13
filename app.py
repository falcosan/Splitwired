from backend.data import data_expenses
from flask_cors import CORS, cross_origin
from flask.helpers import send_from_directory
from flask import Flask, render_template, request

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


@app.route("/expenses", methods=["POST"])
@cross_origin()
def expenses():
    parameter = request.get_json()
    groups = parameter["groups"]
    personal = parameter["personal"]
    csv = parameter["csv"]
    month = parameter["month"]
    year = parameter["year"]
    response = data_expenses(
        groups=groups, personal=personal, csv=csv, month=month, year=year
    )
    return response


if __name__ == "__main__":
    app.run()
