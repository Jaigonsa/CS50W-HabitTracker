from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseForbidden
from django.core.paginator import Paginator
from django.core import serializers
from django.http import JsonResponse
from django import template
import requests
import json

from .models import User, Genre, Habit, Register

register = template.Library()

@register.filter
def range(value):
    return range(value)

# Asign API keys

TMDB_KEY = 'f0ac3d689cbdeec0bbb030e2de2b6efd'


# Define views

@login_required(login_url="login")
def index(request):

    all_registers = Register.objects.order_by("-publishDate")

    # Set max lenght review for preview
    for register in all_registers:

        total_length_short = len(register.registerUser.username) + len(register.registerHabit.title) + len(register.review)
        total_length_long = len(register.registerUser.username) + len(register.registerHabit.title) + len(register.review)

        if total_length_short > 85:
            register.review_short = register.review[:82 - (len(register.registerUser.username) + len(register.registerHabit.title))] + '...'
        else:
            register.review_short = register.review

        if total_length_long > 155:
            register.review_long = register.review[:152 - (len(register.registerUser.username) + len(register.registerHabit.title))] + '...'
        else:
            register.review_long = register.review

    habits = Habit.objects.all()

    return render(request, "habits/index.html", {
        "user": request.user,
        "habits": habits,
        "all_registers": all_registers,
    })


def register(request):

    if request.method == "POST":

        # Read user input
        username = request.POST["username"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        # Chech password and confirmation matches
        if confirmation != password:
            return render (request, "habits/register.html", {
                "message": "Password and confirmation must match."
            })

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return render (request, "habits/register.html", {
                "message": "User already exists."
            })

        # Create user & login
        user = User.objects.create_user(username, password)
        user.save()
        login(request, user)

        return HttpResponseRedirect(reverse("index"))

    else:
        return render(request, "habits/register.html")


def login_view(request):

    if request.method == "POST":

        # Read user input
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Authenticate user
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render (request, "habits/login.html", {
                "message": "Invalid user or password."
            })
    else:
        return render(request, "habits/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))

@login_required
def get_habits(request):
    registers = Register.objects.all().values("startDate", "endDate")
    dates = [register for register in registers]
    return JsonResponse(dates, safe=False)

@login_required
def create_habit(request):
    if request.method == 'POST':
        data =json.loads(request.body)
        title = data.get('title')
        author = data.get('author')
        genre_names = data.get('genre_names')
        image = data.get('image')
        year = data.get('year')

        habit = Habit.objects.create(title=title, author=author, image=image, year=year)

        for genre_name in genre_names:
            genre, created = Genre.objects.get_or_create(genreName=genre_name)
            habit.habitGenre.add(genre)

    return JsonResponse({'message': 'Movie registered successfully.'})

@login_required
def register_habit(request):
    if request.method == 'POST':

        registerUser = request.user

        data = json.loads(request.body)
        title = data.get('title')
        year = data.get('year')
        rating = data.get('rating')
        review = data.get('review')
        startDate = data.get('startDate')
        color = data.get('color')
        image = data.get('image')

        if 'endDate' in data:
            endDate = data.get('endDate')

            registerHabit = Habit.objects.get(title=title)

            register = Register.objects.create(registerUser=registerUser, registerHabit=registerHabit, rating=rating, review=review, startDate=startDate, endDate=endDate, color=color, image=image, year=year)
            register.save()

        else:
            registerHabit = Habit.objects.get(title=title)

            register = Register.objects.create(registerUser=registerUser, registerHabit=registerHabit, rating=rating, review=review, startDate=startDate, color=color, image=image, year=year)
            register.save()


    return JsonResponse({'message': 'Habit registered successfully.'})

@login_required
def get_habits_dates(request):
    if request.method == 'GET':
        user = request.user
        registers = Register.objects.filter(registerUser=user)
        data = [{"startDate": r.startDate, "endDate": r.endDate, "color": r.color, "title": r.registerHabit.title} for r in registers]
        return JsonResponse(data, safe=False)

@login_required
def display_habit(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        title = data.get('title')
        username = data.get('username')
        user = User.objects.get(username=username)
        habit= Habit.objects.get(title=title)
        registered_habit = Register.objects.filter(registerUser=user, registerHabit=habit)
        data = [{"startDate": r.startDate, "endDate": r.endDate, "rating": r.rating, "review": r.review, "image": r.image, "title": r.registerHabit.title, "year": r.registerHabit.year, "user": r.registerUser.username} for r in registered_habit]
        print(data)
        return JsonResponse(data, safe=False)