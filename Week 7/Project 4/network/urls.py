
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("publish", views.publish, name="publish"),
    path("posts/<int:page>", views.posts, name="posts"),
    path("update/<int:post_id>", views.update, name="update")
    # path("posts/<int:post_id", views.post, name="post"),
]
