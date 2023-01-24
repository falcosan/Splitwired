import io
from flask_cors import CORS, cross_origin
from flask import Flask, send_file, render_template, request
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
    (data, file) = data_expenses(
        csv=csv,
        year=year,
        chart=chart,
        group=group,
        month=month,
        category=category,
        personal=personal,
    )
    if file:
        buf_str = io.StringIO(file)
        buf_byt = io.BytesIO(buf_str.read().encode("utf-8"))
        return send_file(
            path_or_file=buf_byt,
            mimetype="text/csv",
            as_attachment=True,
            download_name="data.csv",
        )
    return data


if __name__ == "__main__":
    app.run()
