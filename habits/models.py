from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Avg


RATINGS = (
    (1, '1'),
    (2, '2'),
    (3, '3'),
    (4, '4'),
    (5, '5'),
)


class User(AbstractUser):
    following = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='followers')


class Genre(models.Model):
    genreName = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.genreName}"


class Habit(models.Model):
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=30)
    habitGenre = models.ManyToManyField(Genre, blank=True, related_name="onHabit")
    image = models.URLField(max_length=200)
    year = models.IntegerField()

    def delete(self, *args, **kwargs):
        self.habitGenre.clear()
        super().delete(*args, **kwargs)


    def __str__(self):
        return f"{self.title} ({self.year})"


class Register(models.Model):
    registerUser = models.ForeignKey(User, on_delete=models.CASCADE)
    registerHabit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    year = models.IntegerField()
    publishDate = models.DateTimeField(auto_now_add=True)
    startDate = models.DateField()
    endDate = models.DateField(null=True, blank=True)
    rating = models.IntegerField(blank=True,null=True, choices=RATINGS)
    review = models.TextField(blank=True)
    color = models.CharField(blank=True, max_length=7)
    image = models.URLField(max_length=200, null=True)

    def __str__(self):
        return f"{self.registerHabit} register from {self.registerUser}"