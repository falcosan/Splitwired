from data import expenses
from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/choose_expanses")
def choose_expanses():
    data = expenses(groups=False, csv=False, month=1, year=2021)
    return data


if __name__ == "__main__":
    app.run(debug=True)
