from re import sub
import pandas as pd
from json import dumps
from decimal import Decimal
from datetime import datetime
from calendar import monthrange
from splitwise import Splitwise
from backend.enums import enums_groups, enums_users


def serializer(obj):
    def convert_to_dict(obj):
        if hasattr(obj, "__dict__"):
            return obj.__dict__

    return dumps(obj, default=convert_to_dict)


def get_categories(categories: list) -> list:
    all_categories = []
    for category in categories:
        all_categories.append(category)
        sub_categories = category.getSubcategories()
        if sub_categories == None:
            category["subcategories"] = []
    all_categories.sort(key=lambda category: category.getName())
    return serializer(all_categories)


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
    for _, group in enumerate(instance.getGroups()):
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


def generate_expense(
    expenses: list, filepath: str or None, personal: bool = False, category: int = None
):
    df = []
    df_t = 0

    def filter_expenses(expense):
        if personal:
            return get_unique_user_list(expense.getUsers())
        if category is not None:
            return int(expense.getCategory().getId()) == category
        return not expense.getPayment() and expense.getDate() is not None

    sorted_expanses = list(filter(filter_expenses, expenses))
    sorted_expanses.sort(
        key=lambda expense: datetime.strptime(expense.getDate(), "%Y-%m-%dT%H:%M:%SZ")
    )
    for i, expense in enumerate(sorted_expanses):
        unique_user_list = get_unique_user_list(expense.getUsers())
        if (
            not expense.getDeletedBy()
            and expense.getCost().replace(".", "", 1).isdigit()
        ):
            if personal:
                for user in unique_user_list:
                    df_t = df_t + Decimal(user.getOwedShare()).quantize(Decimal("0.00"))
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
            df_d[get_user_name(user)] = user.getOwedShare()
        df_d["Deleted"] = "-X-" if expense.getDeletedBy() else None
        df.append(df_d)
    return df, get_csv(df, filepath) if filepath else None
