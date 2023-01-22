from re import sub
import pandas as pd
from decimal import Decimal
from json import dumps, loads
from datetime import datetime
from calendar import monthrange
from splitwise import Splitwise
from plotly import graph_objects as go
from backend.enums import enums_groups, enums_users


def serializer(data, to_json=False):
    def convert_to_dict(data):
        if hasattr(data, "__dict__"):
            return data.__dict__

    result = dumps(data, default=convert_to_dict)
    return loads(result) if to_json else result


def set_dates(month: int = None, year: int = None) -> tuple[datetime, datetime, str]:
    if month and (month < 1 or month > 12):
        raise AttributeError("Selected month is not valid")
    if year and len(str(year)) != 4:
        raise AttributeError("Selected year is not valid")
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
        raise AttributeError("Selected date is about the future")
    if month:
        dated_name = dated_after.strftime("_%d-%m-%Y")
    elif year:
        dated_name = dated_after.strftime("_%Y")
    else:
        dated_name = ""
    return dated_after, dated_before, dated_name


def get_user_name(user: type):
    return f"{user.getFirstName() or ''} {user.getLastName() or ''}" if user else None


def get_unique_user_list(arr: list):
    return list(
        filter(
            lambda user: str(user.getId())
            == str(enums_users.get_user_prop("me", "id")),
            arr,
        )
    )


def get_csv(df: list, filepath: str):
    filepath = sub("([A-Z]\w+$)", "_\\1", filepath).lower()
    if not ".csv" in filepath:
        filepath = f"{filepath}.csv"
    df = pd.DataFrame(df)
    return df.to_csv(filepath, index=False)


def get_home_expense(
    limit: int = 999,
) -> tuple[int, int, str]:
    group_id: int = int(enums_groups.get_group_prop("first", "id"))
    expense_name: str = enums_groups.get_group_prop("first", "name")
    return (
        limit,
        group_id,
        expense_name,
    )


def get_personal_expense(
    instance: Splitwise, dated_after: datetime, dated_before: datetime, limit: int = 999
):
    expenses = []
    expense_name = enums_users.get_user_prop("me", "filepath")
    for group in instance.getGroups():
        grupal_expenses = instance.getExpenses(
            limit=limit,
            group_id=int(group.getId()),
            dated_after=dated_after,
            dated_before=dated_before,
        )
        expenses.extend(grupal_expenses)
    return (expenses, expense_name)


def get_grupal_expense(
    instance: Splitwise,
    limit: int = 999,
) -> tuple[int, int, str]:
    groups = instance.getGroups()
    for num, group in enumerate(groups):
        print(f"{str(num)}: {group.getName()}")
    group_num = input("Choose a group with a number:\n")
    group = groups[int(group_num)]
    group_id: int = int(group.getId())
    expense_name: str = group.getName().replace("/", "").replace(" ", "_")
    return (
        limit,
        group_id,
        expense_name,
    )


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


def generate_chart(data, chart_type: str or list[str] = "pie"):
    charts = []
    types = {"pie": go.Pie}

    def get_data(value):
        return list(map(lambda d: d[value], data))

    config = {
        "pie": {
            "labels": get_data("name"),
            "values": get_data("cost"),
            "textinfo": "label+percent",
            "hole": 0.3,
        },
    }
    layout = {
        "height": 1024,
        "width": 1440,
        "margin": dict(l=50, r=50, b=100, t=100, pad=4),
    }
    for chart in [chart_type] if type(chart_type) == str else chart_type:
        chart = chart.lower()
        data = [types[chart](**config[chart])]
        fig = go.Figure(data=data, layout=layout)
        charts.append(fig.to_plotly_json())
    return charts


def generate_expense(
    expenses: list,
    filepath: str or None,
    category: int = None,
    personal: bool = False,
    chart: str or list = False,
):
    df = []
    dd = []
    dc = []
    df_t = 0
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

    def number_to_decimal(number):
        return Decimal(number).quantize(Decimal("0.00"))

    def date_to_format(date):
        return datetime.strptime(date, "%Y-%m-%dT%H:%M:%SZ").strftime("%d %B %Y")

    for i, expense in enumerate(sorted_expenses):
        users_list = expense.getUsers()
        unique_user_list = get_unique_user_list(users_list)
        if expense.getCost().replace(".", "", 1).isdigit():
            if personal:
                for user in unique_user_list:
                    df_t = df_t + number_to_decimal(user.getOwedShare())
            else:
                df_t = df_t + number_to_decimal(expense.getCost())
        df_d = {
            "1: Number": i + 1,
            "2: Id": expense.getId(),
            "3: Description": expense.getDescription(),
            "4: Date": date_to_format(expense.getDate()),
            "5: Category": expense.getCategory().getName(),
            "6: Cost": number_to_decimal(expense.getCost()),
            "7: Total": df_t,
            "8: Currency": expense.getCurrencyCode(),
        }
        dd_d = {
            "id": expense.getId(),
            "category": {
                "name": expense.getCategory().getName(),
                "id": expense.getCategory().getId(),
            },
            "cost": number_to_decimal(expense.getCost()),
        }
        dc_d = {
            "name": expense.getCategory().getName(),
            "cost": number_to_decimal(expense.getCost()),
            "date": date_to_format(expense.getDate()),
        }
        for user in unique_user_list if personal else users_list:
            df_d[get_user_name(user)] = number_to_decimal(user.getOwedShare())
            dd_d["user_cost"] = number_to_decimal(user.getOwedShare())
        df.append(df_d)
        dd.append(dd_d)
        if chart:
            dc.append(dc_d)
    if chart:
        dc = generate_chart(dc, chart_type=chart)
    return {"table": df, "data": dd, "chart": dc}, get_csv(
        df, filepath
    ) if filepath else None
