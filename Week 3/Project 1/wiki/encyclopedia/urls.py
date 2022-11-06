from django.urls import path

from . import views

urlpatterns = [

    # index path for home page
    path("", views.index, name="index"),

    # dynamic path for each entry at /wiki/entry
    path("wiki/<str:page>", views.page, name="page"),

    #  dynamic path to edit any entry at /edit/entry
    path("edit/<str:page>", views.edit, name="edit"),

    # path for creating a new page
    path("create", views.create, name="create"),

    # path for acting on a search
    path("search", views.search, name="search")
]
