from rest_framework import serializers
from .models import User, Subscription
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    subscribers_count = serializers.SerializerMethodField()
    subscriptions_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'bio', 'subscribers_count', 'subscriptions_count']

    def get_subscribers_count(self, obj):
        return obj.subscribers.count()

    def get_subscriptions_count(self, obj):
        return obj.subscriptions.count()

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
    target_user = UserSerializer(read_only=True)
    subscriber = UserSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'target_user', 'subscriber', 'created_at']
        read_only_fields = ['created_at']