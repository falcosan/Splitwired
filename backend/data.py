from splitwise import Splitwise
from backend.config import config as cf
from backend.utils import (
    set_dates,
    generate_expense,
    get_grupal_expense,
    get_personal_expense,
)

instance = Splitwise(cf.consumer_key, cf.consumer_secret, api_key=cf.api_key)


def expenses(
    groups: bool = False,
    personal: bool = False,
    csv: bool = False,
    month: int = None,
    year: int = None,
):
    dated_after, dated_before, date_control, dated_name = set_dates(month, year)
    if groups:
        expenses_prop = get_grupal_expense(
            groups=instance.getGroups(),
            limit=999,
        )
    else:
        expenses_prop = get_personal_expense(
            personal=personal,
            limit=999,
        )
    (
        offset,
        limit,
        group_id,
        friendship_id,
        updated_after,
        updated_before,
        expense_name,
    ) = expenses_prop
    try:
        if date_control:
            raise AttributeError("Date not valid")
        expenses = instance.getExpenses(
            offset,
            limit,
            group_id,
            friendship_id,
            dated_after,
            dated_before,
            updated_after,
            updated_before,
        )
        return generate_expense(
            expenses,
            f"{expense_name}{dated_name}" if csv else None,
        )
    except ValueError as error:
        return TypeError(error)
