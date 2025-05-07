from rest_framework import serializers
from .models import Trip, Location, Wishlist, Comment, TripImage
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

class TripImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripImage
        fields = ['id', 'image', 'is_main']

class TripSerializer(TaggitSerializer, serializers.ModelSerializer):
    locations = LocationSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    tags = TagListSerializerField()
    is_liked = serializers.SerializerMethodField()
    total_likes = serializers.IntegerField(read_only=True)
    images = TripImageSerializer(many=True, read_only=True)
    main_image = serializers.SerializerMethodField()

    def get_main_image(self, obj):
        main_image = obj.images.filter(is_main=True).first()
        if main_image:
            return main_image.image.url
        return None

    def validate(self, data):
        required_fields = ['title', 'description']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: "This field is required."})
        
        if not data.get('tags'):
            raise serializers.ValidationError({"tags": "At least one tag is required."})
            
        return data
    
    class Meta:
        model = Trip
        fields = ['id', 'title', 'description', 'author', 
                 'locations', 'created_at', 'tags', 'comments', 
                 'is_liked', 'total_likes', 'images', 'main_image']
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

class WishlistTripSerializer(TaggitSerializer, serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    
    def get_main_image(self, obj):
        main_image = obj.images.filter(is_main=True).first()
        if main_image:
            return main_image.image.url
        return None
    
    class Meta:
        model = Trip
        fields = ['id', 'title', 'description', 'author', 'created_at', 'main_image']

class WishlistSerializer(serializers.ModelSerializer):
    trip = WishlistTripSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'trip', 'created_at']
        read_only_fields = ['created_at']

class WishlistCreateSerializer(serializers.ModelSerializer):
    trip_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['trip_id']
        extra_kwargs = {
            'trip_id': {'required': True}
        }

    def create(self, validated_data):
        trip_id = validated_data.pop('trip_id')
        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            raise serializers.ValidationError({"trip_id": "Trip does not exist"})
        
        wishlist_item = Wishlist.objects.create(
            trip=trip,
            user=self.context['request'].user
        )
        return wishlist_item