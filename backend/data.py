from splitwise import Splitwise
from backend.config import config as cf
from backend.utils import (
    set_dates,
    get_categories,
    generate_expense,
    get_home_expense,
    get_grupal_expense,
    get_personal_expense,
)

instance = Splitwise(cf.consumer_key, cf.consumer_secret, api_key=cf.api_key)


def data_expenses(
    csv: bool = False,
    groups: bool = False,
    personal: bool = False,
    year: int or str = None,
    month: int or str = None,
    chart: str or list = False,
    category: int or str = None,
):
    if year and isinstance(year, str):
        year = int(year)
    if month and isinstance(month, str):
        month = int(month)
    if category:
        if isinstance(category, str):
            category = int(category)
        category_found = get_categories(
            categories=instance.getCategories(), category=category
        )
        category_name = f'{category_found.getName().replace("/", "").replace(" ", "_")}'
    else:
        category_name = ""
    dated_after, dated_before, dated_name = set_dates(month, year)
    try:
        if personal:
            (expenses, expense_name) = get_personal_expense(
                instance=instance,
                dated_after=dated_after,
                dated_before=dated_before,
                limit=999,
            )
        else:
            if groups:
                (limit, group_id, expense_name) = get_grupal_expense(
                    instance=instance,
                    limit=999,
                )
            else:
                (limit, group_id, expense_name) = get_home_expense(
                    limit=999,
                )
            expenses = instance.getExpenses(
                limit=limit,
                group_id=group_id,
                dated_after=dated_after,
                dated_before=dated_before,
            )
        return generate_expense(
            csv=csv,
            chart=chart,
            expenses=expenses,
            personal=personal,
            category=category,
            filepath=f"{expense_name}{category_name}{dated_name}",
        )
    except ValueError as error:
        return TypeError(error)
