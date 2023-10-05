from app import flask_app
from .utils import serializer
from .enums import enums_users
from flask import redirect, url_for
from flask_login import UserMixin, LoginManager

login_manager = LoginManager()
login_manager.init_app(flask_app)


class Authentication(UserMixin):
    authentications = {
        v["username"]: {**v} for _, v in serializer(enums_users, to_json=True).items()
    }

    def __init__(self, username):
        self.id = username
        self.token = self.authentications[username]["id"]
        self.password = self.authentications[username]["password"]
        self.filepath = self.authentications[username]["filepath"]

    @classmethod
    def contain(self, username):
        return username not in self.authentications

    @classmethod
    def check(self, username, password):
        return (
            username in self.authentications
            and self.authentications[username]["password"] == password
        )


@login_manager.user_loader
def user_loader(username):
    if Authentication.contain(username):
        return
    return Authentication(username)


@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for("login"))
