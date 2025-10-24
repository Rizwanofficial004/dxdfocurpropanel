from django.urls import path
from .views import SyncStaffsAPIView, UpdateStaffAPIView

urlpatterns = [
    path('sync-staffs/', SyncStaffsAPIView.as_view(), name='sync-staffs'),
    path('update-staff/<str:staff_id>/', UpdateStaffAPIView.as_view(), name='update-staff'),
]
