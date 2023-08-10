from django.contrib import admin
from .models import User, Genre, Habit, Register

# Register your models here.
admin.site.register(User)
admin.site.register(Genre)
admin.site.register(Habit)
admin.site.register(Register)