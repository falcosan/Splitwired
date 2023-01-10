from datetime import datetime
from calendar import monthrange
from splitwise import Splitwise
from utils import csv_generator
from settings import config as cf

instance = Splitwise(cf.consumer_key, cf.consumer_secret, api_key=cf.api_key)


def expenses(include_all_groups: bool = False, month: int = None, year: int = None):
    offset = None
    limit = 999
    if include_all_groups == True:
        groups = instance.getGroups()
        for num, group in enumerate(groups):
            print(f"{str(num)}: {group.getName()}")
        group_num = input("Choose a group with a number:\n")
        group_id = groups[int(group_num)].getId()
    else:
        group_id = cf.first_group
    friendship_id = None
    dated_after = (
        datetime(year or datetime.now().date().year, month, 1, 0, 0, 0)
        if month
        else None
    )
    dated_before = (
        datetime(
            year or datetime.now().date().year,
            month,
            monthrange(dated_after.year, dated_after.month)[1],
            23,
            59,
            59,
        )
        if month
        else None
    )
    updated_after = None
    updated_before = None
    try:
        if dated_after.date() > datetime.now().date():
            dated_after = None
            dated_before = None
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
        date = (
            f"_{dated_after.date().day}-{ dated_after.date().month}-{ dated_after.date().year}"
            if dated_after
            else ""
        )
        selected_group = instance.getGroup(group_id)
        return csv_generator(expenses, f"{selected_group.getName()}{date}")
    except ValueError as error:
        TypeError(error)
