from splitwise import Splitwise
from backend.config import config as cf
from backend.utils import (
    set_dates,
    serializer,
    generate_expense,
    get_grupal_expense,
    get_home_expense,
)

instance = Splitwise(cf.consumer_key, cf.consumer_secret, api_key=cf.api_key)


def data_expenses(
    groups: bool = False,
    personal: bool = False,
    csv: bool = False,
    month: int = None,
    year: int = None,
):
    dated_after, dated_before, date_control, dated_name = set_dates(month, year)
    if personal:
        personal_groups = instance.getGroups()
        grupal_personal_expenses = []
        for _, group in enumerate(personal_groups):
            group_id = int(group.getId())
            grupal_expenses = instance.getExpenses(
                offset=None,
                limit=999,
                group_id=group_id,
                friendship_id=None,
                dated_after=dated_after,
                dated_before=dated_before,
                updated_after=None,
                updated_before=None,
            )
            grupal_personal_expenses.extend(grupal_expenses)
        return generate_expense(
            grupal_personal_expenses,
            filepath=f"dd{dated_name}.csv" if csv else None,
            personal=True,
        )
    else:
        if groups:
            (
                offset,
                limit,
                group_id,
                friendship_id,
                updated_after,
                updated_before,
                expense_name,
            ) = get_grupal_expense(
                groups=instance.getGroups(),
                limit=999,
            )
        else:
            (
                offset,
                limit,
                group_id,
                friendship_id,
                updated_after,
                updated_before,
                expense_name,
            ) = get_home_expense(
                limit=999,
            )
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
