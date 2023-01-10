import json
from re import sub
import pandas as pd
from datetime import datetime


def serializer(obj):
    def convert_to_dict(obj):
        return obj.__dict__

    return json.dumps(obj, default=convert_to_dict)


def csv_generator(expenses, filepath):
    filepath = sub("([A-Z]\w+$)", "_\\1", filepath).lower()
    if not ".csv" in filepath:
        filepath = f"{filepath}.csv"
    df = []
    for expense in expenses:
        df_d = {
            "Description": expense.getDescription(),
            "Date": datetime.strptime(expense.getDate(), "%Y-%m-%dT%H:%M:%SZ").strftime(
                "%d %B %Y"
            ),
            "Category": expense.getCategory().getName(),
            "Details": expense.getDetails(),
            "Cost": expense.getCost(),
            "Currency": expense.getCurrencyCode(),
            "Receipt": str(expense.getReceipt().getOriginal()),
            "Deleted": expense.getDeletedBy(),
        }
        df.append(df_d)
    df = pd.DataFrame(df)

    def get_user_name(user):
        if user != None:
            return f"{user.getFirstName()} {user.getLastName()}"
        else:
            return None

    df["Deleted"] = df.apply(lambda row: get_user_name(row["Deleted"]), axis=1)
    df.to_csv(filepath, encoding="utf-8", index=False)
