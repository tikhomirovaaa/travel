from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from reportlab.pdfgen import canvas
from io import BytesIO
from django.shortcuts import get_object_or_404
from .models import Trip, Wishlist, Comment
from .serializers import TripSerializer, WishlistSerializer, PDFDownloadSerializer, CommentSerializer
from users.models import User

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all().order_by('-created_at')
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
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

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def download(self, request):
        serializer = PDFDownloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        trip_ids = serializer.validated_data['trip_ids']
        format_type = serializer.validated_data['format']
        
        if format_type == 'pdf':
            buffer = BytesIO()
            p = canvas.Canvas(buffer)
            
            p.setFont("Helvetica-Bold", 16)
            p.drawString(100, 800, "Your Travel Wishlist")
            
            p.setFont("Helvetica", 12)
            y_position = 750
            for trip in Trip.objects.filter(id__in=trip_ids):
                locations = trip.locations.all()
                if locations.exists():
                    country = locations[0].country
                else:
                    country = "No location specified"
                p.drawString(100, y_position, f"- {trip.title} ({country})")
                y_position -= 20
            
            p.save()
            buffer.seek(0)
            return Response(
                buffer.getvalue(),
                content_type='application/pdf',
                headers={'Content-Disposition': 'attachment; filename="wishlist.pdf"'}
            )
        
        elif format_type == 'txt':
            content = "Your Travel Wishlist:\n\n"
            for trip in Trip.objects.filter(id__in=trip_ids):
                locations = trip.locations.all()
                if locations.exists():
                    country = locations[0].country
                else:
                    country = "No location specified"
                content += f"- {trip.title} ({country})\n"
            
            return Response(
                content,
                content_type='text/plain',
                headers={'Content-Disposition': 'attachment; filename="wishlist.txt"'}
            )

class SubscriptionTripViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        subscribed_users = User.objects.filter(
            subscribers__subscriber=self.request.user
        )
        return Trip.objects.filter(author__in=subscribed_users).order_by('-created_at')