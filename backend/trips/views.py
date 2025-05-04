from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from reportlab.pdfgen import canvas
from io import BytesIO
from django.shortcuts import get_object_or_404
from .models import Trip, Wishlist, Comment, TripImage
from .serializers import TripSerializer, WishlistSerializer, WishlistCreateSerializer, PDFDownloadSerializer, CommentSerializer
from users.models import User
from django.core.files.base import ContentFile
import base64

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-created_at')
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        tags = self.request.data.getlist('tags')
        images = self.request.FILES.getlist('images')
        instance = serializer.save(author=self.request.user)
        
        if tags:
            instance.tags.set(tags)
            
        for i, image in enumerate(images):
            TripImage.objects.create(
                trip=instance,
                image=image,
                is_main=i == 0
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        trip = self.get_object()
        user = request.user
        
        if trip.likes.filter(id=user.id).exists():
            trip.likes.remove(user)
            return Response({'status': 'unliked'})
        else:
            trip.likes.add(user)
            return Response({'status': 'liked'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def comment(self, request, pk=None):
        trip = self.get_object()
        serializer = CommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(trip=trip, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return WishlistCreateSerializer
        return WishlistSerializer

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('trip')

    def perform_create(self, serializer):
        trip_id = self.request.data.get('trip')
        if Wishlist.objects.filter(user=self.request.user, trip_id=trip_id).exists():
            raise serializers.ValidationError({"detail": "Этот пост уже в избранном"})
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def download(self, request):
        serializer = PDFDownloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        trip_ids = serializer.validated_data['trip_ids']
        format_type = serializer.validated_data['format']
        
        trips = Trip.objects.filter(
            id__in=trip_ids,
            wishlists__user=request.user
        ).prefetch_related('locations', 'author', 'images')
        
        if not trips.exists():
            return Response(
                {"detail": "Не найдено поездок для скачивания"},
                status=status.HTTP_404_NOT_FOUND
            )

        if format_type == 'pdf':
            buffer = BytesIO()
            p = canvas.Canvas(buffer)
            
            p.setFont("Helvetica-Bold", 16)
            p.drawString(100, 800, "Ваше избранное")
            
            p.setFont("Helvetica", 12)
            y_position = 750
            
            for trip in trips:
                p.drawString(100, y_position, f"- {trip.title}")
                p.drawString(120, y_position - 15, f"Автор: {trip.author.username}")
                p.drawString(120, y_position - 30, f"Дата: {trip.created_at.strftime('%d.%m.%Y')}")
                p.drawString(120, y_position - 45, f"Описание: {trip.description[:100]}{'...' if len(trip.description) > 100 else ''}")
                y_position -= 70
            
            p.save()
            buffer.seek(0)
            response = Response(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="wishlist.pdf"'
            return response
        
        elif format_type == 'txt':
            content = "Ваше избранное:\n\n"
            for trip in trips:
                content += f"- {trip.title}\n"
                content += f"  Автор: {trip.author.username}\n"
                content += f"  Дата: {trip.created_at.strftime('%d.%m.%Y')}\n"
                content += f"  Описание: {trip.description[:100]}{'...' if len(trip.description) > 100 else ''}\n\n"
            
            response = Response(content, content_type='text/plain')
            response['Content-Disposition'] = 'attachment; filename="wishlist.txt"'
            return response
        
        return Response(
            {"detail": "Неподдерживаемый формат"},
            status=status.HTTP_400_BAD_REQUEST
        )

class SubscriptionTripViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        subscribed_users = User.objects.filter(
            subscribers__subscriber=self.request.user
        )
        return Trip.objects.filter(author__in=subscribed_users).order_by('-created_at')