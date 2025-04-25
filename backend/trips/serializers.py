from rest_framework import serializers
from .models import Trip, Location, Wishlist

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'country']

class TripSerializer(serializers.ModelSerializer):
    locations = LocationSerializer(many=True, read_only=True)
    author = serializers.StringRelatedField()
    
    class Meta:
        model = Trip
        fields = ['id', 'title', 'description', 'image', 'author', 'locations', 'created_at']

class WishlistSerializer(serializers.ModelSerializer):
    trip = TripSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'trip', 'notes']

class PDFDownloadSerializer(serializers.Serializer):
    trip_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of trip IDs to include in the wishlist"
    )
    format = serializers.ChoiceField(
        choices=['pdf', 'txt'],
        help_text="Output format for the wishlist"
    )