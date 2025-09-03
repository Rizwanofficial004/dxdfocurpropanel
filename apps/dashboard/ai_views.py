"""
AI Views Module

This module provides AI-powered endpoints for the dashboard,
including OpenAI integration for various AI services.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from core.credentials import CredentialsManager
import logging
from datetime import datetime
from typing import Dict, Any

logger = logging.getLogger(__name__)


class AIStatusView(APIView):
    """
    Check AI service status and configuration
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get AI service status
        
        Returns:
            JSON response with AI service status
        """
        try:
            # Get OpenAI credentials
            openai_creds = CredentialsManager.get_openai_credentials()
            
            response_data = {
                "status": "success",
                "message": "AI service status retrieved",
                "data": {
                    "openai": {
                        "configured": openai_creds['is_configured'],
                        "api_key_present": bool(openai_creds['api_key']),
                        "service_name": "OpenAI GPT",
                        "status": "active" if openai_creds['is_configured'] else "inactive"
                    },
                    "available_endpoints": [
                        "/api/ai/status/",
                        "/api/ai/chat/",
                        "/api/ai/analyze/employees/",
                        "/api/ai/generate/report/"
                    ]
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "1.0.0"
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in AIStatusView: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to retrieve AI status: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIChatView(APIView):
    """
    AI Chat endpoint using OpenAI
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Send message to AI and get response
        
        Expected payload:
        {
            "message": "Your question here",
            "context": "optional context"
        }
        """
        try:
            # Check if OpenAI is configured
            openai_creds = CredentialsManager.get_openai_credentials()
            if not openai_creds['is_configured']:
                return Response({
                    "status": "error",
                    "message": "OpenAI is not configured. Please set OPENAI_API_KEY."
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Get message from request
            message = request.data.get('message', '')
            context = request.data.get('context', '')
            
            if not message:
                return Response({
                    "status": "error",
                    "message": "Message is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize OpenAI client
            from openai import OpenAI
            client = OpenAI(api_key=openai_creds['api_key'])
            
            # Prepare prompt
            system_prompt = "You are a helpful AI assistant for DDS Focus Pro Panel dashboard. Help users with questions about employee analytics, dashboard features, and general assistance."
            if context:
                system_prompt += f" Context: {context}"
            
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            
            response_data = {
                "status": "success",
                "message": "AI response generated successfully",
                "data": {
                    "user_message": message,
                    "ai_response": ai_response,
                    "context": context,
                    "model_used": "gpt-3.5-turbo",
                    "tokens_used": response.usage.total_tokens
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "request_id": response.id
                }
            }
            
            logger.info(f"AI chat response generated for user: {request.user.username}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in AIChatView: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to generate AI response: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIEmployeeAnalysisView(APIView):
    """
    AI-powered employee analytics analysis
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Analyze employee data using AI
        
        Expected payload:
        {
            "employee_data": {...},
            "analysis_type": "summary|trends|insights"
        }
        """
        try:
            # Check if OpenAI is configured
            openai_creds = CredentialsManager.get_openai_credentials()
            if not openai_creds['is_configured']:
                return Response({
                    "status": "error",
                    "message": "OpenAI is not configured. Please set OPENAI_API_KEY."
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            employee_data = request.data.get('employee_data', {})
            analysis_type = request.data.get('analysis_type', 'summary')
            
            if not employee_data:
                return Response({
                    "status": "error",
                    "message": "Employee data is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize OpenAI client
            from openai import OpenAI
            client = OpenAI(api_key=openai_creds['api_key'])
            
            # Prepare analysis prompt based on type
            if analysis_type == "summary":
                prompt = f"Analyze this employee data and provide a concise summary: {employee_data}"
            elif analysis_type == "trends":
                prompt = f"Analyze trends in this employee data: {employee_data}"
            elif analysis_type == "insights":
                prompt = f"Provide business insights from this employee data: {employee_data}"
            else:
                prompt = f"Analyze this employee data: {employee_data}"
            
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert data analyst specializing in employee analytics. Provide clear, actionable insights."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            analysis = response.choices[0].message.content
            
            response_data = {
                "status": "success",
                "message": "Employee analysis completed",
                "data": {
                    "analysis_type": analysis_type,
                    "analysis": analysis,
                    "data_analyzed": employee_data,
                    "model_used": "gpt-3.5-turbo",
                    "tokens_used": response.usage.total_tokens
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "request_id": response.id
                }
            }
            
            logger.info(f"AI employee analysis completed: {analysis_type}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in AIEmployeeAnalysisView: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to analyze employee data: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AIReportGeneratorView(APIView):
    """
    AI-powered report generation
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Generate reports using AI
        
        Expected payload:
        {
            "report_type": "employee_summary|performance|growth",
            "data": {...},
            "format": "summary|detailed"
        }
        """
        try:
            # Check if OpenAI is configured
            openai_creds = CredentialsManager.get_openai_credentials()
            if not openai_creds['is_configured']:
                return Response({
                    "status": "error",
                    "message": "OpenAI is not configured. Please set OPENAI_API_KEY."
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            report_type = request.data.get('report_type', 'employee_summary')
            data = request.data.get('data', {})
            format_type = request.data.get('format', 'summary')
            
            # Initialize OpenAI client
            from openai import OpenAI
            client = OpenAI(api_key=openai_creds['api_key'])
            
            # Prepare report prompt
            if report_type == "employee_summary":
                prompt = f"Generate a {format_type} employee report based on this data: {data}"
            elif report_type == "performance":
                prompt = f"Generate a {format_type} performance report based on this data: {data}"
            elif report_type == "growth":
                prompt = f"Generate a {format_type} growth analysis report based on this data: {data}"
            else:
                prompt = f"Generate a {format_type} report based on this data: {data}"
            
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional report writer. Create clear, well-structured reports with actionable recommendations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.2
            )
            
            report = response.choices[0].message.content
            
            response_data = {
                "status": "success",
                "message": "Report generated successfully",
                "data": {
                    "report_type": report_type,
                    "format": format_type,
                    "report": report,
                    "source_data": data,
                    "model_used": "gpt-3.5-turbo",
                    "tokens_used": response.usage.total_tokens,
                    "generated_at": datetime.now().isoformat()
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "request_id": response.id
                }
            }
            
            logger.info(f"AI report generated: {report_type}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in AIReportGeneratorView: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to generate report: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
