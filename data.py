from splitwise import Splitwise
from settings import config as cf
from utils import serializer

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


def expenses(include_all_expenses=False):
    for expense in instance.getExpenses():
        if hasattr(expense, "group_id"):
            if include_all_expenses or str(expense.group_id) == str(cf.first_group):
                print(serializer(expense))
