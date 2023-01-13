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
    groups: bool = False, csv: bool = False, month: int = None, year: int = None
):
    dated_after, dated_before, date_control, dated_name = set_dates(month, year)
    if groups:
        (
            offset,
            limit,
            group_id,
            friendship_id,
            dated_after,
            dated_before,
            updated_after,
            updated_before,
            expanse_name,
        ) = get_grupal_expense(
            groups=instance.getGroups(),
            dated_after=dated_after,
            dated_before=dated_before,
        )
    else:
        (
            offset,
            limit,
            group_id,
            friendship_id,
            dated_after,
            dated_before,
            updated_after,
            updated_before,
            expanse_name,
        ) = get_personal_expense(dated_after=dated_after, dated_before=dated_before)
    try:
        if date_control:
            raise AttributeError("Date not valid")
        return generate_expense(
            instance.getExpenses(
                offset,
                limit,
                group_id,
                friendship_id,
                dated_after,
                dated_before,
                updated_after,
                updated_before,
            ),
            f"{expanse_name}{dated_name}" if csv else None,
        )
    except ValueError as error:
        return TypeError(error)
