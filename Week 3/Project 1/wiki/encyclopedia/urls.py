from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:page>", views.page, name="page"),
    path("create", views.create, name="create")

    # path("search", views.search, name="page")
]
