from rest_framework import serializers
from .models import Trip, Location, Wishlist, Comment
from taggit.serializers import TagListSerializerField, TaggitSerializer
from users.serializers import UserSerializer

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'country']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'text', 'created_at']
        read_only_fields = ['author', 'created_at']

class TripSerializer(TaggitSerializer, serializers.ModelSerializer):
    locations = LocationSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    tags = TagListSerializerField()
    is_liked = serializers.SerializerMethodField()
    total_likes = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Trip
        fields = ['id', 'title', 'description', 'image', 'author', 
                 'locations', 'created_at', 'tags', 'comments', 
                 'is_liked', 'total_likes']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

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