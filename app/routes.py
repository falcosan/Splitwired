import os
from app import flask_app
from .config import config as cf
from .auth import Authentication
from flask_cors import cross_origin
from .utils import responser, set_files
from .data import data_groups, data_expenses
from .enums import enums_headers, enums_folders
from flask_login import login_required, login_user, logout_user
from flask import (
    request,
    url_for,
    redirect,
    make_response,
    render_template,
    send_from_directory,
)

output_folder = enums_folders.get_folder_prop("output", "value")
secret_download_key = enums_headers.get_header_prop("download_secret", "key")
secret_download_value = enums_headers.get_header_prop("download_secret", "value")


@flask_app.route("/")
@cross_origin()
def index():
    return render_template("index.html", environment=cf.environment)


@flask_app.route("/login", methods=["POST"])
@cross_origin()
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    if Authentication.check(username, password):
        user = Authentication(username)
        login_user(user)
    return redirect(url_for("index"))


@flask_app.route("/logout", methods=["POST"])
@cross_origin()
@login_required
def logout():
    logout_user()
    response = make_response("", 204)
    response.headers["Refresh"] = "0; url=/"
    return response


@flask_app.route("/sw.js")
@cross_origin()
@login_required
def sw():
    return flask_app.send_static_file("sw.js")


@flask_app.route("/groups", methods=["GET"])
@cross_origin()
@login_required
def groups():
    return data_groups()


@flask_app.route("/expenses", methods=["POST"])
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


@flask_app.route("/download")
@cross_origin()
@login_required
def download():
    path = os.path.join(os.getcwd(), output_folder)
    os.makedirs(path, exist_ok=True)
    files = [f for f in set_files(os.listdir(output_folder)) if f["extension"] == "csv"]
    response = render_template("templates/download.html", files=files)
    return responser(
        request=request,
        response=response,
        header=secret_download_key,
        secret=secret_download_value,
    )


@flask_app.route("/download/<filename>")
@cross_origin()
@login_required
def download_file(filename):
    return send_from_directory(f"../{output_folder}", filename)
