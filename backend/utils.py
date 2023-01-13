from re import sub
import pandas as pd
from json import dumps
from decimal import Decimal
from datetime import datetime
from calendar import monthrange
from backend.enums import Groups, Users


def serializer(obj):
    def convert_to_dict(obj):
        if hasattr(obj, "__dict__"):
            return obj.__dict__

    return dumps(obj, default=convert_to_dict)


def set_dates(month: int = None, year: int = None):
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
    date_control = dated_after and dated_after.date() > datetime.now().date()
    if month:
        dated_name = dated_after.strftime("_%d-%m-%Y")
    elif year:
        dated_name = dated_after.strftime("_%Y")
    else:
        dated_name = ""
    return dated_after, dated_before, date_control, dated_name


def get_user_name(user: type):
    return f"{user.getFirstName() or ''} {user.getLastName() or ''}" if user else None


def get_unique_user_list(arr: list):
    return list(
        filter(
            lambda user: str(user.getId()) == str(Users().get_user_prop("me", "id")),
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
) -> tuple[None, int, int, None, None, None, str]:
    offset = None
    friendship_id = None
    updated_after = None
    updated_before = None
    group_id: int = int(Groups().get_group_prop("first", "id"))
    expense_name: str = Groups().get_group_prop("first", "name")
    return (
        offset,
        limit,
        group_id,
        friendship_id,
        updated_after,
        updated_before,
        expense_name,
    )


def get_grupal_expense(
    groups: list,
    limit: int = 999,
) -> tuple[None, int, int, None, None, None, str]:
    offset = None
    friendship_id = None
    updated_after = None
    updated_before = None
    for num, group in enumerate(groups):
        print(f"{str(num)}: {group.getName()}")
    group_num = input("Choose a group with a number:\n")
    group = groups[int(group_num)]
    group_id: int = int(group.getId())
    expense_name: str = group.getName().replace("/", "").replace(" ", "_")
    return (
        offset,
        limit,
        group_id,
        friendship_id,
        updated_after,
        updated_before,
        expense_name,
    )


def generate_expense(expenses: list, filepath: str or None, personal: bool = False):
    df = []
    df_t = 0
    sorted_expanses = [expense for expense in expenses if expense.getDate() is not None]
    sorted_expanses.sort(
        key=lambda expense: datetime.strptime(expense.getDate(), "%Y-%m-%dT%H:%M:%SZ")
    )
    if personal:
        sorted_expanses = list(
            filter(
                lambda expense: get_unique_user_list(expense.getUsers()),
                sorted_expanses,
            )
        )
    for i, expense in enumerate(sorted_expanses):
        unique_user_list = get_unique_user_list(expense.getUsers())
        if (
            not expense.getDeletedBy()
            and expense.getCost().replace(".", "", 1).isdigit()
        ):
            if personal:
                for user in unique_user_list:
                    df_t = df_t + Decimal(user.owed_share).quantize(Decimal("0.00"))
            else:
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
        for user in unique_user_list if personal else expense.getUsers():
            if not personal:
                df_d["Paid by"] = get_user_name(user) if user.paid_share else None
            df_d[get_user_name(user)] = user.net_balance
        df_d["Deleted"] = "X" if expense.getDeletedBy() else None
        df.append(df_d)
    if filepath:
        return df, get_csv(df, filepath)
    else:
        return df
