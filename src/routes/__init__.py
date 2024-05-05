from flask import Blueprint, render_template

afd = Blueprint("afd", __name__)
@afd.route("/")
def index():
    return render_template("index.html"),202