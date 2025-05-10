from django.core.management.base import BaseCommand
from users.models import Achievement

class Command(BaseCommand):
    help = 'Create initial achievements'

    def handle(self, *args, **options):
        achievements = [
            {
                'name': 'Первая публикация',
                'description': 'Создал первую запись о путешествии',
                'icon': 'emoji_events',
                'criteria': 'first_post'
            },
            {
                'name': 'Активный автор',
                'description': 'Создал 5 записей о путешествиях',
                'icon': 'stars',
                'criteria': 'five_posts'
            },
            {
                'name': 'Опытный путешественник',
                'description': 'Создал 10 записей о путешествиях',
                'icon': 'military_tech',
                'criteria': 'ten_posts'
            },
            {
                'name': 'Популярный автор',
                'description': 'Получил 10 лайков на одной записи',
                'icon': 'whatshot',
                'criteria': 'popular_post'
            },
        ]
        
        for achievement in achievements:
            Achievement.objects.get_or_create(
                criteria=achievement['criteria'],
                defaults=achievement
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully created initial achievements'))