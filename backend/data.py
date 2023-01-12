from datetime import datetime
from calendar import monthrange
from splitwise import Splitwise
from backend.config import config as cf
from backend.utils import expenses_generator

instance = Splitwise(cf.consumer_key, cf.consumer_secret, api_key=cf.api_key)


def expenses(
    groups: bool = False, csv: bool = False, month: int = None, year: int = None
):
    offset = None
    limit = 999
    if groups == True:
        groups = instance.getGroups()
        for num, group in enumerate(groups):
            print(f"{str(num)}: {group.getName()}")
        group_num = input("Choose a group with a number:\n")
        group_id = groups[int(group_num)].getId()
    else:
        group_id = cf.first_group
    friendship_id = None
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
    updated_after = None
    updated_before = None
    try:
        if dated_after and dated_after.date() > datetime.now().date():
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
        if month:
            date = dated_after.strftime("_%d-%m-%Y")
        elif year:
            date = dated_after.strftime("_%Y")
        else:
            date = ""
        selected_group = instance.getGroup(group_id)
        return expenses_generator(
            expenses, f"{selected_group.getName()}{date}" if csv else None
        )
    except ValueError as error:
        TypeError(error)
