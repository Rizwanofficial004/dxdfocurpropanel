import requests
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import ScreenshotRecord


class SyncStaffsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        crm_url = f"{settings.CRM_BASE_URL}/api/staffs"
        headers = {
            "authtoken": settings.CRM_TOKEN,
            "Accept": "application/json",
        }

        try:
            response = requests.get(crm_url, headers=headers, timeout=30)
            response.raise_for_status()
            crm_data = response.json()
        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to fetch data from CRM: {str(e)}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        updated_records = []

        for staff in crm_data:
            staff_id = staff.get("staffid")
            if not staff_id:
                continue

            full_name = staff.get("full_name") or f"{staff.get('firstname', '')} {staff.get('lastname', '')}".strip()

            # Try to find existing record
            record = ScreenshotRecord.objects.filter(staff_id=staff_id).first()

            if record:
                # Preserve existing screenshot_interval value
                existing_interval = record.screenshot_interval

                # Update other fields from CRM
                record.name = full_name or "Unnamed Staff"
                record.email = staff.get("email")
                record.phone_number = staff.get("phonenumber")
                record.job_position = staff.get("job_position")
                record.save(update_fields=["name", "email", "phone_number", "job_position", "updated_at"])

                # Restore preserved value (in case model default logic overwrites)
                record.screenshot_interval = existing_interval
            else:
                # Create new record with default screenshot_interval = 5
                record = ScreenshotRecord.objects.create(
                    staff_id=staff_id,
                    name=full_name or "Unnamed Staff",
                    email=staff.get("email"),
                    phone_number=staff.get("phonenumber"),
                    job_position=staff.get("job_position"),
                    screenshot_interval=5,
                )

            updated_records.append({
                "id": record.id,
                "name": record.name,
                "email": record.email,
                "staff_id": record.staff_id,
                "phone_number": record.phone_number,
                "job_position": record.job_position,
                "screenshot_interval": record.screenshot_interval,
                "created_at": record.created_at,
                "updated_at": record.updated_at,
            })

        return Response(
            {"count": len(updated_records), "data": updated_records},
            status=status.HTTP_200_OK,
        )




class UpdateStaffAPIView(APIView):
    permission_classes = [AllowAny]

    """
    PUT or PATCH: Update staff details in the local database.
    Example: PUT /api/update-staff/212/
    """

    def put(self, request, staff_id):
        try:
            record = ScreenshotRecord.objects.get(staff_id=staff_id)
        except ScreenshotRecord.DoesNotExist:
            return Response(
                {"error": "Staff not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Fields you allow updating
        allowed_fields = [
            "name",
            "email",
            "phone_number",
            "job_position",
            "screenshot_interval",
        ]

        updated_data = {}
        for field in allowed_fields:
            if field in request.data:
                setattr(record, field, request.data[field])
                updated_data[field] = request.data[field]

        record.save()

        return Response(
            {
                "message": "Staff details updated successfully",
                "updated_data": updated_data,
            },
            status=status.HTTP_200_OK,
        )

