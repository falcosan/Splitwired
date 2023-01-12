from backend.data import expenses
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/expanses", methods=["POST"])
def expanses():
    parameter = request.get_json()
    groups = parameter["groups"]
    csv = parameter["csv"]
    month = parameter["month"]
    year = parameter["year"]
    response = jsonify(expenses(groups, csv, month, year))
    return response
