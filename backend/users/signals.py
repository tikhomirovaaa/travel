from django.db.models.signals import post_save
from django.dispatch import receiver
from trips.models import Trip
from .models import Achievement, UserAchievement

@receiver(post_save, sender=Trip)
def check_achievements(sender, instance, created, **kwargs):
    if created:
        user = instance.author
        trip_count = Trip.objects.filter(author=user).count()
        
        # Проверка достижений
        achievements_to_check = [
            ('first_post', lambda: trip_count == 1),
            ('five_posts', lambda: trip_count == 5),
            ('ten_posts', lambda: trip_count == 10),
        ]
        
        for criteria, condition in achievements_to_check:
            if condition():
                try:
                    achievement = Achievement.objects.get(criteria=criteria)
                    UserAchievement.objects.get_or_create(
                        user=user,
                        achievement=achievement
                    )
                except Achievement.DoesNotExist:
                    pass