from rest_framework import serializers


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
