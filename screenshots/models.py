from django.db import models

class ScreenshotRecord(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    # Simple number field for interval (e.g., 5, 10, 30)
    screenshot_interval = models.PositiveIntegerField(
        help_text="Enter screenshot interval in minutes."
    )

    staff_id = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(max_length=50, null=True, blank=True)
    job_position = models.CharField(max_length=100, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.email})"
