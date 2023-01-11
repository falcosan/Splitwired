import json
from data import expenses
from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/choose_expanses", methods=["POST"])
def choose_expanses():
    parameter = request.get_json()
    groups = parameter["groups"]
    csv = parameter["csv"]
    month = parameter["month"]
    year = parameter["year"]
    return expenses(groups, csv, month, year)


if __name__ == "__main__":
    app.run(debug=True)
