import os
from .__init__ import app
from .auth import Authentication
from flask_cors import cross_origin
from .utils import responser, set_files
from .data import data_groups, data_expenses
from .enums import enums_headers, enums_folders
from flask_login import login_required, login_user
from flask import request, render_template, send_from_directory, redirect, url_for

output_folder = enums_folders.get_folder_prop("output", "value")
secret_download_key = enums_headers.get_header_prop("download_secret", "key")
secret_download_value = enums_headers.get_header_prop("download_secret", "value")


@app.route("/login", methods=["POST"])
@cross_origin()
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    if Authentication.check(username, password):
        user = Authentication(username)
        login_user(user)
    return redirect(url_for("index"))


@app.route("/")
@cross_origin()
def index():
    return render_template("index.html")


@app.route("/groups", methods=["GET"])
@cross_origin()
@login_required
def groups():
    return data_groups()


@app.route("/expenses", methods=["POST"])
@cross_origin()
@login_required
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
@login_required
def download():
    path = os.path.join(os.getcwd(), output_folder)
    os.makedirs(path, exist_ok=True)
    files = set_files(os.listdir(output_folder))
    response = render_template("templates/download.html", files=files)
    return responser(
        request=request,
        response=response,
        header=secret_download_key,
        secret=secret_download_value,
    )


@app.route("/download/<filename>")
@cross_origin()
@login_required
def download_file(filename):
    return send_from_directory(f"../{output_folder}", filename)