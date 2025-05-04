from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import serializers
from .models import User, Subscription
from .serializers import UserProfileSerializer, SubscriptionSerializer, UserUpdateSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

User = get_user_model()

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserProfileSerializer
    lookup_field = 'username'
    
    def get_queryset(self):
        return User.objects.all()
    
    @action(detail=False, methods=['get', 'put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = UserUpdateSerializer(
                request.user, 
                data=request.data, 
                partial=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user)

    def perform_create(self, serializer):
        target_user_id = self.request.data.get('target_user')
        target_user = get_object_or_404(User, id=target_user_id)
        
        if target_user.id == self.request.user.id:
            raise serializers.ValidationError({"detail": "You cannot subscribe to yourself"})
        
        if Subscription.objects.filter(subscriber=self.request.user, target_user=target_user).exists():
            raise serializers.ValidationError({"detail": "You are already subscribed to this user"})
            
        serializer.save(subscriber=self.request.user, target_user=target_user)

    def destroy(self, request, *args, **kwargs):
        try:
            subscription = self.get_object()
            if subscription.subscriber != request.user:
                return Response(
                    {"detail": "You can only unsubscribe from your own subscriptions"},
                    status=status.HTTP_403_FORBIDDEN
                )
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )