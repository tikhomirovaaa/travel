from rest_framework import serializers
from .models import User, Subscription
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'bio']

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

    def to_internal_value(self, data):
        if 'avatar' in data and isinstance(data['avatar'], str) and data['avatar'].startswith('http'):
            data.pop('avatar')
        return super().to_internal_value(data)

class SubscriptionSerializer(serializers.ModelSerializer):
    target_user = UserSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'target_user', 'created_at']
        read_only_fields = ['created_at']