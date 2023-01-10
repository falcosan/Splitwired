from splitwise import Splitwise
from settings import config as cf
from utils import serializer, csv_generator

instance = Splitwise(cf.consumer_key, cf.consumer_secret, api_key=cf.api_key)


def groups():
    for group in instance.getGroups():
        if hasattr(group, "id") and str(group.id) == str(cf.first_group):
            for debt in group.getOriginalDebts():
                print(serializer(debt.getAmount()))


def friends():
    for friend in instance.getFriends():
        if hasattr(friend, "id"):
            for balance in friend.getBalances():
                print(serializer(balance))


def expenses(include_all_groups=False):
    if include_all_groups == True:
        groups = instance.getGroups()
        for num, group in enumerate(groups):
            print(f"{str(num)}: {group.getName()}")
        group_num = input("Elige un grupo seleccionando un numero\n")
        group_id = groups[int(group_num)].getId()
    else:
        group_id = cf.first_group
    selected_group = instance.getGroup(group_id)
    offset = None
    limit = 999
    dated_after = None
    dated_before = None
    friendship_id = None
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
    return csv_generator(expenses, selected_group.getName())
