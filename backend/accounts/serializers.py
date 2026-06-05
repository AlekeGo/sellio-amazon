from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'password', 'full_name')

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError('Email already registered.')
        return value.lower()

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is inactive.')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'avatar_url', 'provider', 'created_at')
        read_only_fields = ('id', 'email', 'provider', 'created_at')


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('full_name',)
