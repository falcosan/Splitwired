from decouple import config
from app.patterns import Singleton


class Config(metaclass=Singleton):
    def __init__(self):
        self.api_key = config("KEY_API")
        self.consumer_key = config("KEY_CONSUMER")
        self.consumer_secret = config("SECRET_CONSUMER")


config = Config()
