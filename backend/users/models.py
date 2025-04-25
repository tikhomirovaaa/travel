from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  

    def __str__(self):
        return self.email

class Subscription(models.Model):
    subscriber = models.ForeignKey(
        User,
        related_name='subscriptions',
        on_delete=models.CASCADE
    )
    target_user = models.ForeignKey(
        User,
        related_name='subscribers',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['subscriber', 'target_user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subscriber} → {self.target_user}"