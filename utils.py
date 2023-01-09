from splitwise import User
from json import dumps


def serializer(obj):
    def convert_to_dict(obj):
        obj_dict = obj.__dict__
        for key, value in obj_dict.items():
            if isinstance(value, User):
                obj_dict[key] = serializer(value)
        return obj_dict

    return dumps(obj, default=convert_to_dict)
