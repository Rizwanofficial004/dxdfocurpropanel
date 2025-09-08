"""
Simple Login API Test Views
For testing authentication without JWT complexity
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import logging

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class SimpleLoginAPIView(APIView):
    """
    Simple Login API - Basic authentication test
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Simple login test without JWT"""
        try:
            data = request.data
            username = data.get('username', '').strip()
            password = data.get('password', '')
            
            logger.info(f"Login attempt: username={username}")
            
            if not username or not password:
                return Response({
                    'status': 'error',
                    'message': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Authenticate user
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    # Generate or get token
                    token, created = Token.objects.get_or_create(user=user)
                    
                    return Response({
                        'status': 'success',
                        'message': 'Login successful',
                        'token': token.key,
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name
                        }
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'status': 'error',
                        'message': 'User account is disabled'
                    }, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({
                    'status': 'error',
                    'message': 'Invalid username or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            logger.error(f"Login API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class UserListAPIView(APIView):
    """
    List all users for testing
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """List all users"""
        try:
            users = User.objects.all()
            user_list = []
            
            for user in users:
                user_list.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined.isoformat()
                })
            
            return Response({
                'status': 'success',
                'total_users': len(user_list),
                'users': user_list
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"User list error: {str(e)}")
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
