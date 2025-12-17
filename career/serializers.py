# career/serializers.py
from rest_framework import serializers
from .models import CareerMessage

class CareerMessageCreateSerializer(serializers.Serializer):
    """
    POST /api/career/sessions/{session_id}/messages
    에서 요청 Body로 들어오는 content만 검증
    """
    content = serializers.CharField(max_length=5000)

class CareerMessageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerMessage
        fields = ["sender", "content", "created_at"]

class RecommendInSerializer(serializers.Serializer):
    top_k = serializers.IntegerField(required=False, min_value=1, max_value=50)

