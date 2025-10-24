from django.contrib import admin
from .models import ScreenshotRecord

@admin.register(ScreenshotRecord)
class ScreenshotRecordAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'screenshot_interval', 'created_at')
    search_fields = ('name', 'email')
