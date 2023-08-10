from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_habit", views.create_habit, name="create_habit"),
    path("register_habit", views.register_habit, name="register_habit"),
    path("get_habits", views.get_habits, name="get_habits"),
    path("get_habits_dates", views.get_habits_dates, name="get_habits_dates"),
    path("display_habit", views.display_habit, name="display_habit"),
]