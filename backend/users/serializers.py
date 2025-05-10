from rest_framework import serializers
from .models import User, Subscription
from django.contrib.auth import get_user_model
from .models import Achievement, UserAchievement

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'bio']

class UserProfileSerializer(UserSerializer):
    subscribers_count = serializers.SerializerMethodField()
    subscriptions_count = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['subscribers_count', 'subscriptions_count', 'is_subscribed']

    def get_subscribers_count(self, obj):
        return obj.subscribers.count()

    def get_subscriptions_count(self, obj):
        return obj.subscriptions.count()

    def get_is_subscribed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.subscribers.filter(subscriber=request.user).exists()
        return False

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 're_password')
        extra_kwargs = {'password': {'write_only': True}}

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'avatar', 'bio']
        extra_kwargs = {
            'username': {'required': False},
            'avatar': {'required': False},
            'bio': {'required': False},
        }

class SubscriptionSerializer(serializers.ModelSerializer):
    target_user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'target_user', 'created_at']
        read_only_fields = ['created_at']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'icon', 'criteria']

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'date_achieved']