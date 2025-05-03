from rest_framework import serializers
from .models import Trip, Location, Wishlist, Comment
from taggit.serializers import TagListSerializerField, TaggitSerializer
from users.serializers import UserSerializer

class PDFDownloadSerializer(serializers.Serializer):
    trip_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=True
    )
    format = serializers.ChoiceField(
        choices=['pdf', 'txt'],
        required=True
    )

    def validate_trip_ids(self, value):
        if not value:
            raise serializers.ValidationError("Должен быть выбран хотя бы один пост")
        if any(not isinstance(trip_id, int) for trip_id in value):
            raise serializers.ValidationError("ID поездки должен быть числом")
        return value

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
    
    def validate(self, data):
        required_fields = ['title', 'description', 'image']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: "This field is required."})
        
        if not data.get('tags'):
            raise serializers.ValidationError({"tags": "At least one tag is required."})
            
        return data
    
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
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'trip', 'notes', 'created_at']
        read_only_fields = ['user', 'created_at']

class WishlistCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = ['trip', 'notes']
