"""
Credentials validation view for checking service configurations
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.credentials import CredentialsManager
import logging

logger = logging.getLogger(__name__)

class CredentialsStatusView(APIView):
    """
    API endpoint to check the status of all service credentials
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        GET /api/credentials/status/
        
        Returns the configuration status of all services
        """
        try:
            service_status = CredentialsManager.get_service_status()
            validation_results = CredentialsManager.validate_all_credentials()
            
            response_data = {
                "status": "success",
                "message": "Credentials status retrieved successfully",
                "data": {
                    "services": service_status,
                    "validation": validation_results,
                    "summary": {
                        "total_services": len(service_status),
                        "configured_services": sum(1 for s in service_status.values() if s['status'] == 'configured'),
                        "configuration_complete": all(validation_results.values())
                    }
                }
            }
            
            logger.info("Credentials status checked", extra={
                "user": request.user.username if request.user.is_authenticated else "anonymous",
                "configured_services": response_data["data"]["summary"]["configured_services"]
            })
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving credentials status: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to retrieve credentials status: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
