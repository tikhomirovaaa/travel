from django.db import models
from django.conf import settings
from taggit.managers import TaggableManager

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
    image = models.ImageField(upload_to='trips/')  # Убедитесь что это поле правильно определено
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='liked_trips',
        blank=True
    )
    tags = TaggableManager(blank=True)

    def __str__(self):
        return self.title

    @property
    def total_likes(self):
        return self.likes.count()

    @property
    def main_image(self):
        return self.images.first()

class TripImage(models.Model):
    trip = models.ForeignKey(Trip, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='trips/')
    is_main = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.is_main:
            self.trip.images.update(is_main=False)
        super().save(*args, **kwargs)

class TripLocation(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.trip.title} - {self.location.name}"

class Comment(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.trip.title}"

class Wishlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_wishlist'
    )
    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name='trip_wishlists'
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'trip']
        ordering = ['-created_at']
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранные'

    def __str__(self):
        return f"{self.user.username} - {self.trip.title}"