from re import sub
import pandas as pd
import yfinance as yf
from decimal import Decimal
from json import dumps, loads
from calendar import monthrange
from splitwise import Splitwise
from flask import make_response
import plotly.graph_objects as go
from flask_login import current_user
from requests import Request, Response
from .enums import enums_groups, enums_folders
from datetime import datetime, date, timedelta


def serializer(data, to_json=False):
    def convert_to_dict(data):
        if hasattr(data, "__dict__"):
            return data.__dict__

    result = dumps(data, default=convert_to_dict)
    return loads(result) if to_json else result


def responser(
    request: Request,
    response: Response,
    header: str,
    secret: str,
    message: str = "Rejected",
):
    if not request.headers.get(header) == secret:
        return make_response(dumps({"message": message}), 401)
    else:
        return response


def set_dates(month: int = None, year: int = None):
    if month and (month < 1 or month > 12):
        raise ValueError("Selected month is not valid")
    if year and len(str(year)) != 4:
        raise ValueError("Selected year is not valid")
    dated_after = (
        datetime(year or datetime.now().date().year, month or 1, 1, 0, 0, 0)
        if month or year
        else None
    )
    dated_before = (
        datetime(
            year or datetime.now().date().year,
            month or 12,
            monthrange(dated_after.year, dated_after.month)[1],
            23,
            59,
            59,
        )
        if month or year
        else None
    )
    if dated_after and dated_after.date() > datetime.now().date():
        raise ValueError("Selected date is about the future")
    if month:
        dated_name = dated_after.strftime("_%m-%Y")
    elif year:
        dated_name = dated_after.strftime("_%Y")
    else:
        dated_name = ""
    return dated_after, dated_before, dated_name


def set_files(files: list):
    return list(
        map(
            lambda file: {
                "index": str(file[0] + 1),
                "name": file[1],
                "date": datetime.now().date().strftime("%d-%m-%Y"),
            },
            enumerate(files),
        )
    )


def set_currency_conversion(
    amount: float,
    curr_from: str,
    conv_date: date,
):
    ticker = f"{curr_from}EUR=X"
    currency_data = yf.Ticker(ticker).history(
        start=conv_date, end=conv_date + timedelta(days=1)
    )
    if currency_data["Close"].last_valid_index() is None:
        return set_currency_conversion(
            amount, curr_from, conv_date=conv_date - timedelta(days=1)
        )
    exchange_rate = currency_data["Close"][-1]
    return str(exchange_rate * amount)


def costs_conversions(cost: str, context: dict):
    currency = context.getCurrencyCode()
    if cost and currency.lower() != "eur":
        if isinstance(cost, str):
            cost = float(cost)
        conv_date = datetime.strptime(context.getDate(), "%Y-%m-%dT%H:%M:%SZ")
        cost = set_currency_conversion(
            amount=cost,
            curr_from=currency,
            conv_date=conv_date,
        )
    return cost


def get_user_name(user: type):
    return f"{user.getFirstName() or ''} {user.getLastName() or ''}" if user else None


def get_unique_user_list(arr: list):
    return list(
        filter(
            lambda user: str(user.getId()) == str(current_user.__dict__.get("token")),
            arr,
        )
    )


def get_home_expense(limit: int = 9999):
    group_id: int = int(enums_groups.get_group_prop("first", "id"))
    expense_name: str = enums_groups.get_group_prop("first", "name")
    return (
        limit,
        group_id,
        expense_name,
    )


def get_grupal_expense(instance: Splitwise, group: int, limit: int = 9999):
    group = instance.getGroup(group)
    group_id = int(group.getId())
    expense_name: str = group.getName().replace("/", "").replace(" ", "_")
    return (
        limit,
        group_id,
        expense_name,
    )


def get_personal_expense(
    instance: Splitwise,
    dated_after: datetime,
    dated_before: datetime,
    limit: int = 9999,
):
    expenses = []
    expense_name = current_user.__dict__.get("filepath")
    for group in instance.getGroups():
        grupal_expenses = instance.getExpenses(
            limit=limit,
            group_id=int(group.getId()),
            dated_after=dated_after,
            dated_before=dated_before,
        )
        expenses.extend(grupal_expenses)
    return (expenses, expense_name)


def get_groups(groups: list):
    groups = list(
        filter(
            lambda g: g["id"] != 0
            and g["id"] != int(enums_groups.get_group_prop("first", "id")),
            list(map(lambda g: {"name": g.getName(), "id": g.getId()}, groups)),
        )
    )
    return serializer(groups)


def get_categories(categories: list, category: int = None) -> list:
    categories_all = []
    for original_category in categories:
        categories_all.append(original_category)
        sub_categories = original_category.getSubcategories()
        if sub_categories and len(sub_categories):
            for sub_category in sub_categories:
                if not len(sub_category.getSubcategories()):
                    del sub_category.subcategories
                categories_all.append(sub_category)
        del original_category.subcategories
    if category != None:
        category_found = next(
            original_category
            for original_category in categories_all
            if original_category.getId() == category
        )
    return category_found if category != None else categories_all


def get_csv(data: list, filepath: str, additional_data: tuple = None):
    cleaned_path = sub("([A-Z]\w+$)", "\\1", filepath).lower()
    filename = f"{cleaned_path}.csv" if not ".csv" in cleaned_path else cleaned_path
    output_folder = enums_folders.get_folder_prop("output", "value")
    data_frame_principal = pd.DataFrame(data)
    data_frame_additional = None
    if additional_data:
        listing_additional_data = list(
            map(
                lambda d: [d.capitalize() if isinstance(d, str) else d], additional_data
            )
        )
        data_frame_additional = pd.DataFrame(
            listing_additional_data[1], columns=listing_additional_data[0]
        )

    df = pd.concat([data_frame_principal, data_frame_additional], ignore_index=True)
    return df.to_csv(
        path_or_buf=f"{output_folder}/{filename}", index=False, header=True, sep=";"
    )


def date_to_format(date):
    return datetime.strptime(date, "%Y-%m-%dT%H:%M:%SZ").strftime("%d %B %Y")


def number_to_decimal(number):
    return Decimal(number).quantize(Decimal("0.00"))


def generate_chart(data, chart_type: str or list[str] = "pie", filename: str = "None"):
    def get_data(value):
        return list(map(lambda d: d[value], data))

    charts = []
    content = {
        "pie": {
            "type": go.Pie,
            "title": f"Percentage - {filename}" if filename else "Pie chart",
            "filename": f"pie_chart_{filename}" if filename else "pie_chart",
            "labels": get_data("name"),
            "values": get_data("cost"),
            "textinfo": "label+percent",
            "hovertemplate": "%{label}: <br>%{percent}</br> %{value} €<extra></extra>",
            "hole": 0.3,
            "marker": dict(line=dict(color="#000000", width=1)),
        },
        "bar": {
            "type": go.Bar,
            "title": f"Quantity - {filename}" if filename else "Bar chart",
            "filename": f"bar_chart_{filename}" if filename else "bar_chart",
            "y": list(map(lambda d: get_data("name").count(d), get_data("name"))),
            "x": get_data("name"),
            "text": "y",
            "customdata": get_data("date"),
            "texttemplate": "%{y}",
            "hovertemplate": "%{x}<br>Date: %{customdata}</br><extra></extra>",
        },
    }
    for chart in [chart_type] if type(chart_type) == str else chart_type:
        chart = chart.lower()
        layout = {
            "title": content[chart]["title"],
            "height": 1024,
            "barmode": "relative",
            "autosize": True,
            "showlegend": False,
            "margin": dict(l=50, r=50, b=100, t=100),
        }
        if chart == "bar":
            layout["yaxis"] = dict(tickvals=[])
        config = {
            "autosizable": True,
            "toImageButtonOptions": {
                "format": "svg",
                "filename": content[chart]["filename"],
            },
        }
        data = [
            content[chart]["type"](
                **{
                    k: v
                    for k, v in content[chart].items()
                    if k != "filename" and k != "type" and k != "title"
                }
            )
        ]
        fig = go.Figure(data=data, layout=layout)
        json = fig.to_plotly_json()
        json["config"] = config
        charts.append(json)
    return charts


def generate_expense(
    csv: bool,
    expenses: list,
    filename: str or None,
    category: int = None,
    personal: bool = False,
    chart: str or list = False,
):
    df = []
    dd = []
    dc = []
    dt_d = 0
    sorted_expenses = list(
        filter(
            lambda expense: not expense.getDeletedAt()
            and not expense.getPayment()
            and expense.getDate() != None,
            expenses,
        )
    )
    if personal:
        sorted_expenses = list(
            filter(
                lambda expense: get_unique_user_list(expense.getUsers()),
                sorted_expenses,
            )
        )
    if category != None:
        sorted_expenses = list(
            filter(
                lambda expense: int(expense.getCategory().getId()) == category,
                sorted_expenses,
            )
        )
    sorted_expenses.sort(
        key=lambda expense: datetime.strptime(expense.getDate(), "%Y-%m-%dT%H:%M:%SZ")
    )
    for i, expense in enumerate(sorted_expenses):
        users_list = expense.getUsers()
        unique_user_list = get_unique_user_list(users_list)
        cost = costs_conversions(expense.getCost(), expense)
        if cost.replace(".", "", 1).isdigit():
            if personal:
                for user in unique_user_list:
                    user_cost = costs_conversions(user.getOwedShare(), expense)
                    dt_d = dt_d + number_to_decimal(user_cost)
            else:
                dt_d = dt_d + number_to_decimal(cost)
        df_d = {
            "1: Number": i + 1,
            "2: Description": expense.getDescription(),
            "3: Date": date_to_format(expense.getDate()),
            "4: Category": expense.getCategory().getName(),
            "5: Cost": number_to_decimal(cost),
            "6: Total": dt_d,
            "7: Currency": f"{expense.getCurrencyCode()} > EUR"
            if expense.getCurrencyCode().lower() != "eur"
            else expense.getCurrencyCode(),
            "id": expense.getId(),
        }
        dd_d = {
            "id": expense.getId(),
            "category": {
                "name": expense.getCategory().getName(),
                "id": expense.getCategory().getId(),
            },
            "cost": number_to_decimal(cost),
        }
        dc_d = {
            "name": expense.getCategory().getName(),
            "cost": number_to_decimal(cost) if not personal else None,
            "date": date_to_format(expense.getDate()),
        }
        for user in unique_user_list if personal else users_list:
            user_cost = costs_conversions(user.getOwedShare(), expense)
            df_d[get_user_name(user)] = number_to_decimal(user_cost)
            dd_d["user_cost"] = number_to_decimal(user_cost)
            if personal:
                dc_d["cost"] = number_to_decimal(user_cost)
        df.append(df_d)
        dd.append(dd_d)
        if chart:
            dc.append(dc_d)
    if chart:
        dc = generate_chart(dc, chart_type=chart, filename=filename)
    if csv:
        d_df = list(map(lambda obj: {k: v for k, v in obj.items() if k != "id"}, df))
        get_csv(d_df, filename, ("average", number_to_decimal(dt_d / len(d_df))))
    return {"table": df, "data": dd, "chart": dc}
