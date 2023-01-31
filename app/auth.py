from .__init__ import app
from .utils import serializer
from .enums import enums_users
from flask import redirect, url_for
from flask_login import UserMixin, LoginManager

login_manager = LoginManager()
login_manager.init_app(app)


class Authentication(UserMixin):
    authentications = {
        v["username"]: {"password": v["password"]}
        for _, v in serializer(enums_users, to_json=True).items()
    }

    def __init__(self, username):
        self.id = username
        self.password = self.authentications[username]["password"]

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


@login_manager.request_loader
def request_loader(request):
    username = request.form.get("username")
    if Authentication.contain(username):
        return
    return Authentication(username)


@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for("login"))
