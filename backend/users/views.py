from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User, Subscription
from .serializers import UserSerializer, SubscriptionSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user)

    def perform_create(self, serializer):
        serializer.save(subscriber=self.request.user)