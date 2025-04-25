from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from reportlab.pdfgen import canvas
from io import BytesIO
from .models import Trip, Wishlist
from .serializers import TripSerializer, WishlistSerializer, PDFDownloadSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

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
        
        # Получаем список выбранных путешествий
        trip_ids = serializer.validated_data['trip_ids']
        format_type = serializer.validated_data['format']
        
        # Генерация PDF
        if format_type == 'pdf':
            buffer = BytesIO()
            p = canvas.Canvas(buffer)
            
            # Заголовок
            p.setFont("Helvetica-Bold", 16)
            p.drawString(100, 800, "Your Travel Wishlist")
            
            # Список мест
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
        
        # Генерация TXT
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