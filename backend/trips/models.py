from django.db import models
from django.conf import settings

class Location(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name}, {self.country}"

class Trip(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trips'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='trips/')
    locations = models.ManyToManyField(Location, through='TripLocation')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class TripLocation(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.trip.title} - {self.location.name}"

class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wishlist'
    )
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name='in_wishlists'
    )
    notes = models.TextField(blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'trip']
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.user}'s wish: {self.trip.title}"
    