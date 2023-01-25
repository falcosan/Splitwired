import os
from backend.utils import responser
from flask_cors import CORS, cross_origin
from backend.data import data_groups, data_expenses
from backend.enums import enums_headers, enums_folders
from flask import Flask, request, render_template, send_from_directory

app = Flask(__name__, template_folder="static")
CORS(app)

output_folder = enums_folders.get_folder_prop("output", "value")
secret_download_key = enums_headers.get_header_prop("download_secret", "key")
secret_download_value = enums_headers.get_header_prop("download_secret", "value")


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
    path = os.path.join(os.getcwd(), output_folder)
    os.makedirs(path, exist_ok=True)
    files = os.listdir(output_folder)
    response = render_template("templates/download.html", files=files)
    return responser(
        request=request,
        response=response,
        header=secret_download_key,
        secret=secret_download_value,
    )


@app.route("/download/<filename>")
@cross_origin()
def download_file(filename):
    return send_from_directory(output_folder, filename)


if __name__ == "__main__":
    app.run()
