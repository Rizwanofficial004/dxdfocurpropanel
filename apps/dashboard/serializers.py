from rest_framework import serializers
from .models import UserTimer, UserNumericValue


class EmployeeAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for employee analytics data
    """
    total_employees = serializers.IntegerField()
    growth_rate = serializers.CharField()
    active_users = serializers.IntegerField()
    last_updated = serializers.CharField()
    
    class Meta:
        fields = ['total_employees', 'growth_rate', 'active_users', 'last_updated']


class EmployeeBreakdownSerializer(serializers.Serializer):
    """
    Serializer for employee breakdown data
    """
    active = serializers.IntegerField()
    inactive = serializers.IntegerField()
    pending = serializers.IntegerField()


class EmployeeAnalyticsMetaSerializer(serializers.Serializer):
    """
    Serializer for employee analytics metadata
    """
    source = serializers.CharField()
    bucket = serializers.CharField()
    timestamp = serializers.CharField()


class EmployeeAnalyticsResponseSerializer(serializers.Serializer):
    """
    Complete serializer for employee analytics API response
    """
    status = serializers.CharField()
    message = serializers.CharField()
    data = serializers.DictField()
    
    def to_representation(self, instance):
        """
        Custom representation to structure the response properly
        """
        return {
            "status": instance.get("status", "success"),
            "message": instance.get("message", "Employee analytics retrieved successfully"),
            "data": {
                "total_employees": instance.get("data", {}).get("total_employees", 0),
                "growth_rate": instance.get("data", {}).get("growth_rate", "0.0%"),
                "active_users": instance.get("data", {}).get("active_users", 0),
                "last_updated": instance.get("data", {}).get("last_updated", ""),
                "breakdown": instance.get("data", {}).get("breakdown", {}),
                "meta": instance.get("data", {}).get("meta", {})
            }
        }


class UserTimerSerializer(serializers.ModelSerializer):
    """
    Serializer for UserTimer model
    """
    duration_formatted = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserTimer
        fields = [
            'id', 'user', 'username', 'duration_seconds', 
            'duration_formatted', 'start_time', 'end_time',
            'timer_name', 'notes'
        ]
        read_only_fields = ['user', 'start_time', 'end_time']


class TimerCreateSerializer(serializers.Serializer):
    """
    Serializer for creating timer sessions
    """
    duration_seconds = serializers.IntegerField(min_value=1, help_text="Timer duration in seconds")
    timer_name = serializers.CharField(max_length=100, required=False, default="Timer Session")
    notes = serializers.CharField(required=False, allow_blank=True)


class UserNumericValueSerializer(serializers.ModelSerializer):
    """
    Serializer for UserNumericValue model
    """
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = UserNumericValue
        fields = [
            'id', 'user_id', 'username', 'value', 
            'description', 'last_updated', 'created_at'
        ]
        read_only_fields = ['user', 'last_updated', 'created_at']


class UserNumericValueCreateSerializer(serializers.Serializer):
    """
    Serializer for creating/updating user numeric values
    """
    value = serializers.IntegerField(help_text="Numeric value for the user")
    description = serializers.CharField(max_length=200, required=False, allow_blank=True)
