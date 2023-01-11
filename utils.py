from re import sub
import pandas as pd
from json import dumps
from decimal import Decimal
from datetime import datetime


def serializer(obj):
    def convert_to_dict(obj):
        if hasattr(obj, "__dict__"):
            return obj.__dict__

    return dumps(obj, default=convert_to_dict)


def csv_generator(expenses: list, filepath: str):
    filepath = sub("([A-Z]\w+$)", "_\\1", filepath).lower()
    if not ".csv" in filepath:
        filepath = f"{filepath}.csv"
    df = []
    df_t = 0

    def get_user_name(user: type):
        return f"{user.getFirstName()} {user.getLastName()}" if user else None

    for i, expense in enumerate(reversed(expenses)):
        if (
            not expense.getDeletedBy()
            and expense.getCost().replace(".", "", 1).isdigit()
        ):
            df_t = df_t + Decimal(expense.getCost()).quantize(Decimal("0.00"))
        df_d = {
            "Number": i + 1,
            "Description": expense.getDescription(),
            "Date": datetime.strptime(expense.getDate(), "%Y-%m-%dT%H:%M:%SZ").strftime(
                "%d %B %Y"
            ),
            "Category": expense.getCategory().getName(),
            "Details": expense.getDetails(),
            "Cost": expense.getCost(),
            "Total": df_t,
            "Currency": expense.getCurrencyCode(),
        }
        for user in expense.getUsers():
            df_d["Paid by"] = get_user_name(user) if user.paid_share else None
            df_d[get_user_name(user)] = user.net_balance
        df_d["Deleted"] = "X" if expense.getDeletedBy() else None
        df.append(df_d)
    df = pd.DataFrame(df)
    df.to_csv(filepath, encoding="utf-8", index=False)
