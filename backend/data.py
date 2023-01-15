from splitwise import Splitwise
from backend.config import config as cf
from backend.utils import (
    set_dates,
    get_categories,
    get_home_expense,
    generate_expense,
    get_grupal_expense,
    get_personal_expense,
)

instance = Splitwise(cf.consumer_key, cf.consumer_secret, api_key=cf.api_key)


def data_categories():
    return get_categories(instance=instance)


def data_expenses(
    groups: bool = False,
    personal: bool = False,
    category: int = None,
    csv: bool = False,
    month: int = None,
    year: int = None,
):
    dated_after, dated_before, date_control, dated_name = set_dates(month, year)
    if not personal:
        if groups:
            (limit, group_id, expense_name) = get_grupal_expense(
                instance=instance,
                limit=999,
            )
        else:
            (limit, group_id, expense_name) = get_home_expense(
                limit=999,
            )
    try:
        if date_control:
            raise AttributeError("Date not valid")
        if personal:
            (expenses, expense_name) = get_personal_expense(
                instance=instance,
                dated_after=dated_after,
                dated_before=dated_before,
                limit=999,
            )
        else:
            expenses = instance.getExpenses(
                limit=limit,
                group_id=group_id,
                dated_after=dated_after,
                dated_before=dated_before,
            )
        return generate_expense(
            expenses,
            f"{expense_name}{dated_name}" if csv else None,
            personal=personal,
            category=category,
        )
    except ValueError as error:
        return TypeError(error)
