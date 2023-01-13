from decouple import config
from backend.patterns import Singleton


class Groups(metaclass=Singleton):
    def __init__(self):
        self.personal = {"id": config("ID_PERSONAL_GROUP"), "name": "dd"}
        self.first = {"id": config("ID_FIRST_GROUP"), "name": "ago_dan"}

    def get_group_prop(self, group: str, key: str):
        dict_value = getattr(self, group, None)
        if dict_value:
            return dict_value.get(key, "Key not found")
        else:
            return TypeError("Group not found")
