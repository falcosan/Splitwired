from decouple import config
from patterns import Singleton


class Config(metaclass=Singleton):
    def __init__(self):
        self.api_key = config("KEY_API")
        self.consumer_key = config("KEY_CONSUMER")
        self.consumer_secret = config("SECRET_CONSUMER")
        # GROUPS IDS
        self.first_group = config("ID_FIRST_GROUP")


config = Config()
