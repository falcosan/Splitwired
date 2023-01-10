from re import sub
import pandas as pd
from decimal import Decimal
from datetime import datetime


def csv_generator(expenses: list, filepath: str):
    filepath = sub("([A-Z]\w+$)", "_\\1", filepath).lower()
    if not ".csv" in filepath:
        filepath = f"{filepath}.csv"
    df = []
    df_t = 0
    for i, expense in enumerate(expenses):
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
            "Deleted": expense.getDeletedBy(),
        }
        df.append(df_d)
    df = pd.DataFrame(df)

    def get_user_name(user: type):
        if user != None:
            return f"{user.getFirstName()} {user.getLastName()}"
        else:
            return None

    df["Deleted"] = df.apply(lambda row: get_user_name(row["Deleted"]), axis=1)
    df.to_csv(filepath, encoding="utf-8", index=False)
