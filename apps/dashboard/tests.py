from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from .services import S3EmployeeService, AWSCredentialsManager
from .models import EmployeeAnalytics, AWSCredential


class EmployeesAnalyticsAPITest(TestCase):
    """
    Test cases for Employee Analytics API
    """
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create test AWS credential
        self.aws_credential = AWSCredential.objects.create(
            name="test_aws_s3",
            credential_type="aws",
            description="Test AWS S3 credentials",
            access_key="AKIAIOSFODNN7EXAMPLE",
            secret_key="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
            region="us-east-1",
            bucket_name="test-bucket",
            is_active=True,
            is_production=False
        )
        
        self.url = reverse('dashboard:employees-analytics')
    
    @patch('apps.dashboard.services.boto3.client')
    def test_get_employees_analytics_success(self, mock_boto_client):
        """Test successful retrieval of employee analytics"""
        # Mock S3 response
        mock_s3_client = MagicMock()
        mock_boto_client.return_value = mock_s3_client
        mock_s3_client.list_objects_v2.return_value = {
            'KeyCount': 32
        }
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['total_employees'], 32)
        self.assertIn('growth_rate', response.data['data'])
        self.assertIn('active_users', response.data['data'])
    
    @patch('apps.dashboard.services.boto3.client')
    def test_get_employees_analytics_s3_error(self, mock_boto_client):
        """Test API response when S3 returns an error"""
        # Mock S3 error
        mock_boto_client.side_effect = Exception("S3 connection error")
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data['status'], 'error')
        self.assertIn('error', response.data)
    
    def test_get_employees_analytics_unauthorized(self):
        """Test API requires authentication"""
        self.client.force_authenticate(user=None)
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class S3EmployeeServiceTest(TestCase):
    """
    Test cases for S3EmployeeService
    """
    
    @patch('apps.dashboard.services.boto3.client')
    def test_get_employees_count(self, mock_boto_client):
        """Test getting employee count from S3"""
        # Mock S3 response
        mock_s3_client = MagicMock()
        mock_boto_client.return_value = mock_s3_client
        mock_s3_client.list_objects_v2.return_value = {
            'KeyCount': 45
        }
        
        service = S3EmployeeService()
        result = service.get_employees_count()
        
        self.assertEqual(result['total_employees'], 45)
        self.assertEqual(result['active_users'], 45)
        self.assertIn('growth_rate', result)
        self.assertIn('last_updated', result)
    
    @patch('apps.dashboard.services.boto3.client')
    def test_get_detailed_employee_analytics(self, mock_boto_client):
        """Test getting detailed employee analytics"""
        # Mock S3 response
        mock_s3_client = MagicMock()
        mock_boto_client.return_value = mock_s3_client
        mock_s3_client.list_objects_v2.return_value = {
            'KeyCount': 32
        }
        
        service = S3EmployeeService()
        result = service.get_detailed_employee_analytics()
        
        self.assertEqual(result['total_count'], 32)
        self.assertIn('breakdown', result)
        self.assertIn('source', result)
        self.assertEqual(result['source'], 'AWS S3')


class AWSCredentialsManagerTest(TestCase):
    """
    Test cases for AWSCredentialsManager
    """
    
    def test_credentials_initialization(self):
        """Test AWS credentials manager initialization"""
        manager = AWSCredentialsManager()
        
        self.assertEqual(manager.credentials['name'], 'aws_s3_production')
        self.assertEqual(manager.credentials['credential_type'], 'aws')
        self.assertTrue(manager.credentials['is_active'])
        self.assertTrue(manager.credentials['is_production'])
    
    def test_get_bucket_name(self):
        """Test getting bucket name"""
        manager = AWSCredentialsManager()
        bucket_name = manager.get_bucket_name()
        
        self.assertEqual(bucket_name, 'my-app-storage')
    
    @patch('apps.dashboard.services.boto3.client')
    def test_get_s3_client(self, mock_boto_client):
        """Test S3 client initialization"""
        mock_s3_client = MagicMock()
        mock_boto_client.return_value = mock_s3_client
        
        manager = AWSCredentialsManager()
        client = manager.get_s3_client()
        
        mock_boto_client.assert_called_once_with(
            's3',
            aws_access_key_id='AKIAIOSFODNN7EXAMPLE',
            aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            region_name='us-east-1'
        )


class EmployeeAnalyticsModelTest(TestCase):
    """
    Test cases for EmployeeAnalytics model
    """
    
    def test_create_employee_analytics(self):
        """Test creating employee analytics record"""
        analytics = EmployeeAnalytics.objects.create(
            total_employees=50,
            growth_rate=15.5,
            active_users=48,
            inactive_users=2,
            source_bucket='test-bucket'
        )
        
        self.assertEqual(analytics.total_employees, 50)
        self.assertEqual(analytics.growth_rate, 15.5)
        self.assertEqual(analytics.growth_rate_percentage, '15.5%')
        self.assertEqual(str(analytics), f'Employee Analytics - 50 employees ({analytics.updated_at.strftime("%Y-%m-%d %H:%M")})')
    
    def test_get_latest_analytics(self):
        """Test getting latest analytics record"""
        # Create multiple records
        EmployeeAnalytics.objects.create(total_employees=30, growth_rate=10.0)
        latest = EmployeeAnalytics.objects.create(total_employees=35, growth_rate=12.0)
        
        result = EmployeeAnalytics.get_latest()
        self.assertEqual(result.id, latest.id)
        self.assertEqual(result.total_employees, 35)


class AWSCredentialModelTest(TestCase):
    """
    Test cases for AWSCredential model
    """
    
    def test_create_aws_credential(self):
        """Test creating AWS credential record"""
        credential = AWSCredential.objects.create(
            name='test_credential',
            credential_type='aws',
            description='Test credential',
            access_key='AKIAIOSFODNN7EXAMPLE',
            secret_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            region='us-west-2',
            bucket_name='test-bucket'
        )
        
        self.assertEqual(credential.name, 'test_credential')
        self.assertEqual(credential.masked_access_key, 'AKIA...MPLE')
        self.assertEqual(credential.masked_secret_key, '****LKEY')
        self.assertEqual(str(credential), 'test_credential (aws)')
    
    def test_masked_credentials(self):
        """Test credential masking"""
        credential = AWSCredential(
            access_key='AKIAIOSFODNN7EXAMPLE',
            secret_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
        )
        
        self.assertEqual(credential.masked_access_key, 'AKIA...MPLE')
        self.assertEqual(credential.masked_secret_key, '****LKEY')
