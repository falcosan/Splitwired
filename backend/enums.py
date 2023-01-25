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
            raise TypeError("Group not found")


class Users(metaclass=Singleton):
    def __init__(self):
        self.dan = {
            "id": config("ID_DAN_USER"),
            "name": "Daniele Falchetti",
            "filepath": "dd",
        }
        self.ago = {
            "id": config("ID_AGO_USER"),
            "name": "Agostina Dimaio",
            "filepath": "ago",
        }

    def get_user_prop(self, user: str, key: str):
        dict_value = getattr(self, user, None)
        if dict_value:
            return dict_value.get(key, "Key not found")
        else:
            raise TypeError("User not found")


class Headers(metaclass=Singleton):
    def __init__(self):
        self.download_secret = {
            "key": "secret",
            "value": config("HEADER_DOWNLOAD_SECRET"),
        }

    def get_header_prop(self, group: str, key: str):
        dict_value = getattr(self, group, None)
        if dict_value:
            return dict_value.get(key, "Key not found")
        else:
            raise TypeError("Header not found")


class Folders(metaclass=Singleton):
    def __init__(self):
        self.output = {"value": "output"}

    def get_folder_prop(self, group: str, key: str):
        dict_value = getattr(self, group, None)
        if dict_value:
            return dict_value.get(key, "Key not found")
        else:
            raise TypeError("Folder not found")


enums_users = Users()
enums_groups = Groups()
enums_folders = Folders()
enums_headers = Headers()
