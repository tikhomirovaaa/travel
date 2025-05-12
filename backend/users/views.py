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
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'username'

    def get_queryset(self):
        queryset = super().get_queryset()
        username = self.request.query_params.get('username')
        if username:
            return queryset.filter(username=username)
        return queryset
    
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
    lookup_field = 'target_user_id'  # Изменяем lookup_field на target_user_id

    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user)

    def create(self, request, *args, **kwargs):
        target_user_id = request.data.get('target_user')
        target_user = get_object_or_404(User, id=target_user_id)
        
        if target_user.id == request.user.id:
            return Response(
                {"detail": "You cannot subscribe to yourself"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if Subscription.objects.filter(subscriber=request.user, target_user=target_user).exists():
            return Response(
                {"detail": "You are already subscribed to this user"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        subscription = Subscription.objects.create(
            subscriber=request.user,
            target_user=target_user
        )
        serializer = self.get_serializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        target_user_id = kwargs.get('target_user_id')
        target_user = get_object_or_404(User, id=target_user_id)
        
        subscription = get_object_or_404(
            Subscription,
            subscriber=request.user,
            target_user=target_user
        )
        
        subscription.delete()
        return Response(
            {"detail": "Successfully unsubscribed"},
            status=status.HTTP_204_NO_CONTENT
        )