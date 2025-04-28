from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from trips.views import TripViewSet, WishlistViewSet, SubscriptionTripViewSet
from users.views import UserViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'users', UserViewSet, basename='user')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'subscription-trips', SubscriptionTripViewSet, basename='subscription-trips')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.authtoken')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)