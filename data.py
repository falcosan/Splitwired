from splitwise import Splitwise
from utils import csv_generator
from settings import config as cf

instance = Splitwise(cf.consumer_key, cf.consumer_secret, api_key=cf.api_key)


def expenses(include_all_groups=False):
    offset = None
    limit = 999
    if include_all_groups == True:
        groups = instance.getGroups()
        for num, group in enumerate(groups):
            print(f"{str(num)}: {group.getName()}")
        group_num = input("Elige un grupo seleccionando un numero\n")
        group_id = groups[int(group_num)].getId()
    else:
        group_id = cf.first_group
    friendship_id = None
    dated_after = None
    dated_before = None
    updated_after = None
    updated_before = None
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
    selected_group = instance.getGroup(group_id)
    return csv_generator(expenses, selected_group.getName())
