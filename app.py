from flask_cors import CORS, cross_origin
from flask.helpers import send_from_directory
from flask import Flask, render_template, request
from backend.data import data_expenses, data_categories

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


@app.route("/categories")
@cross_origin()
def categories():
    categories = data_categories()
    return categories


@app.route("/expenses", methods=["POST"])
@cross_origin()
def expenses():
    parameter = request.get_json()
    csv = parameter["csv"]
    year = parameter["year"]
    month = parameter["month"]
    groups = parameter["groups"]
    personal = parameter["personal"]
    category = parameter["category"]
    response = data_expenses(
        groups=groups,
        personal=personal,
        category=category,
        csv=csv,
        month=month,
        year=year,
    )
    return response


if __name__ == "__main__":
    app.run()
