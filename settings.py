import os
from patterns import Singleton
from dotenv import load_dotenv

load_dotenv()


class Config(metaclass=Singleton):
    def __init__(self):
        self.api_key = os.getenv("KEY_API")
        self.consumer_key = os.getenv("KEY_CONSUMER")
        self.consumer_secret = os.getenv("SECRET_CONSUMER")
        # GROUPS IDS
        self.first_group = os.getenv("ID_FIRST_GROUP")


config = Config()
