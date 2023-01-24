from flask_cors import CORS, cross_origin
from flask.helpers import send_from_directory
from flask import Flask, render_template, request
from backend.data import data_groups, data_expenses

app = Flask(__name__, template_folder="static")
CORS(app)


@app.route("/")
@cross_origin()
def index():
    return render_template("index.html")


@app.route("/groups", methods=["GET"])
@cross_origin()
def groups():
    return data_groups()


@app.route("/expenses", methods=["POST"])
@cross_origin()
def expenses():
    parameter = request.get_json()
    csv = parameter.get("csv", False)
    year = parameter.get("year", None)
    month = parameter.get("month", None)
    group = parameter.get("group", None)
    chart = parameter.get("chart", False)
    category = parameter.get("category", None)
    personal = parameter.get("personal", False)
    response = data_expenses(
        csv=csv,
        year=year,
        chart=chart,
        group=group,
        month=month,
        category=category,
        personal=personal,
    )
    return response


if __name__ == "__main__":
    app.run()
