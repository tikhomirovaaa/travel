from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import User, Subscription
from .serializers import UserSerializer, SubscriptionSerializer, UserUpdateSerializer
from django.shortcuts import get_object_or_404

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get', 'put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PUT':
            serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
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
        target_user = get_object_or_404(User, id=self.request.data.get('target_user'))
        serializer.save(subscriber=self.request.user, target_user=target_user)