from os import listdir
from backend.utils import responser
from backend.enums import enums_headers
from flask_cors import CORS, cross_origin
from backend.data import data_groups, data_expenses
from flask import Flask, request, render_template, send_from_directory

app = Flask(__name__, template_folder="static", static_url_path="")
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
    return data_expenses(
        csv=csv,
        year=year,
        chart=chart,
        group=group,
        month=month,
        category=category,
        personal=personal,
    )


@app.route("/download")
@cross_origin()
def download():
    response = render_template("download.html", files=listdir("output"))
    return responser(
        request=request,
        response=response,
        header=enums_headers.get_header_prop("download_secret", "key"),
        secret=enums_headers.get_header_prop("download_secret", "value"),
    )


@app.route("/download/<filename>")
@cross_origin()
def download_file(filename):
    return send_from_directory("output", filename)


if __name__ == "__main__":
    app.run()
