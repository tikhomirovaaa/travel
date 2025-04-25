from rest_framework import serializers
from .models import User, Subscription

# Перенесите UserSerializer перед SubscriptionSerializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'bio']

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 're_password')
        extra_kwargs = {'password': {'write_only': True}}

class SubscriptionSerializer(serializers.ModelSerializer):
    # Теперь UserSerializer уже определен
    target_user = UserSerializer(read_only=True)
    
    class Meta:
        model = Subscription
        fields = ['id', 'target_user', 'created_at']
        read_only_fields = ['created_at']