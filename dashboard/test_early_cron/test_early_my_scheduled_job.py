"""
Unit tests for the `my_scheduled_job` function in dashboard/cron.py

Tested function: dashboard.cron.my_scheduled_job

Test categories:
- Happy path: @pytest.mark.happy_path
- Edge cases: @pytest.mark.edge_case

All external dependencies are mocked.
"""

import pytest
from unittest.mock import patch, MagicMock

# Patch the logger to avoid actual logging during tests
@pytest.fixture(autouse=True)
def patch_logger():
    with patch("dashboard.cron.logger") as mock_logger:
        yield mock_logger

@pytest.fixture
def mock_user_logs():
    with patch("dashboard.cron.User_Logs") as mock_logs:
        yield mock_logs

class TestMyScheduledJob:
    @pytest.mark.happy_path
    def test_single_user_single_valid_image(self, mock_user_logs):
        """
        Test that my_scheduled_job processes a single user with one valid image and creates a new log.
        """
        user = {"email": "user1@example.com", "staffid": "S1"}
        image_url = {"Key": "folder/image1.png"}
        all_data = {"image_urls": [image_url]}
        presigned_url = "https://bucket/folder/image1.png"
        focus_timeline = {"result": "ok"}

        with patch("dashboard.cron.get_all_user", return_value=[user]) as mock_get_all_user, \
             patch("dashboard.cron.scan_and_download_screenshots", return_value=all_data) as mock_scan, \
             patch("dashboard.cron.generate_predesigned_url", return_value=presigned_url) as mock_presign, \
             patch("dashboard.cron.process_images_in_batches", return_value=focus_timeline) as mock_process:

            # Mock update_or_create to return (obj, created)
            mock_user_logs.objects.update_or_create.return_value = (MagicMock(), True)

            from dashboard.cron import my_scheduled_job
            my_scheduled_job()

            mock_get_all_user.assert_called_once()
            mock_scan.assert_called_once_with("user1@example.com", "2025-06-10", True)
            mock_presign.assert_called_once_with("ddsfocustime", "folder/image1.png")
            mock_process.assert_called_once()
            mock_user_logs.objects.update_or_create.assert_called_once_with(
                email="user1@example.com",
                date="2025-06-10",
                defaults={
                    "staffid": "S1",
                    "jsonlog": focus_timeline
                }
            )

    @pytest.mark.happy_path
    def test_multiple_users_multiple_images(self, mock_user_logs):
        """
        Test that my_scheduled_job processes multiple users, each with multiple valid images.
        """
        users = [
            {"email": "user1@example.com", "staffid": "S1"},
            {"email": "user2@example.com", "staffid": "S2"}
        ]
        image_urls = [
            {"Key": "img1.jpg"},
            {"Key": "img2.png"},
            {"Key": "img3.webp"}
        ]
        all_data = {"image_urls": image_urls}
        presigned_url = "https://bucket/fake"
        focus_timeline = {"result": "ok"}

        with patch("dashboard.cron.get_all_user", return_value=users), \
             patch("dashboard.cron.scan_and_download_screenshots", return_value=all_data), \
             patch("dashboard.cron.generate_predesigned_url", return_value=presigned_url), \
             patch("dashboard.cron.process_images_in_batches", return_value=focus_timeline):

            mock_user_logs.objects.update_or_create.return_value = (MagicMock(), False)

            from dashboard.cron import my_scheduled_job
            my_scheduled_job()

            assert mock_user_logs.objects.update_or_create.call_count == 2

    @pytest.mark.happy_path
    def test_image_with_non_image_extension_is_skipped(self, mock_user_logs):
        """
        Test that images with non-image extensions are skipped and not processed.
        """
        user = {"email": "user1@example.com", "staffid": "S1"}
        image_urls = [
            {"Key": "img1.txt"},
            {"Key": "img2.exe"},
            {"Key": "img3.jpg"}
        ]
        all_data = {"image_urls": image_urls}
        presigned_url = "https://bucket/img3.jpg"
        focus_timeline = {"result": "ok"}

        with patch("dashboard.cron.get_all_user", return_value=[user]), \
             patch("dashboard.cron.scan_and_download_screenshots", return_value=all_data), \
             patch("dashboard.cron.generate_predesigned_url", return_value=presigned_url) as mock_presign, \
             patch("dashboard.cron.process_images_in_batches", return_value=focus_timeline):

            mock_user_logs.objects.update_or_create.return_value = (MagicMock(), True)

            from dashboard.cron import my_scheduled_job
            my_scheduled_job()

            # Only one valid image should be processed
            mock_presign.assert_called_once_with("ddsfocustime", "img3.jpg")

    @pytest.mark.edge_case
    def test_no_users(self, mock_user_logs):
        """
        Test that my_scheduled_job handles the case where get_all_user returns an empty list.
        """
        with patch("dashboard.cron.get_all_user", return_value=[]), \
             patch("dashboard.cron.scan_and_download_screenshots") as mock_scan, \
             patch("dashboard.cron.generate_predesigned_url") as mock_presign, \
             patch("dashboard.cron.process_images_in_batches") as mock_process:

            from dashboard.cron import my_scheduled_job
            my_scheduled_job()

            mock_scan.assert_not_called()
            mock_presign.assert_not_called()
            mock_process.assert_not_called()
            assert not mock_user_logs.objects.update_or_create.called

    @pytest.mark.edge_case
    def test_user_with_no_images(self, mock_user_logs):
        """
        Test that my_scheduled_job handles a user with no images (empty image_urls list).
        """
        user = {"email": "user1@example.com", "staffid": "S1"}
        all_data = {"image_urls": []}

        with patch("dashboard.cron.get_all_user", return_value=[user]), \
             patch("dashboard.cron.scan_and_download_screenshots", return_value=all_data) as mock_scan, \
             patch("dashboard.cron.generate_predesigned_url") as mock_presign, \
             patch("dashboard.cron.process_images_in_batches") as mock_process:

            from dashboard.cron import my_scheduled_job
            my_scheduled_job()

            mock_scan.assert_called_once()
            mock_presign.assert_not_called()
            mock_process.assert_not_called()
            assert not mock_user_logs.objects.update_or_create.called

    @pytest.mark.edge_case
    def test_scan_and_download_screenshots_raises_exception(self, mock_user_logs):
        """
        Test that my_scheduled_job continues processing other users if scan_and_download_screenshots raises an exception for one user.
        """
        users = [
            {"email": "user1@example.com", "staffid": "S1"},
            {"email": "user2@example.com", "staffid": "S2"}
        ]
        all_data = {"image_urls": [{"Key": "img1.jpg"}]}
        presigned_url = "https://bucket/img1.jpg"
        focus_timeline = {"result": "ok"}

        def scan_side_effect(email, date, flag):
            if email == "user1@example.com":
                raise Exception("Download error")
            return all_data

        with patch("dashboard.cron.get_all_user", return_value=users), \
             patch("dashboard.cron.scan_and_download_screenshots", side_effect=scan_side_effect), \
             patch("dashboard.cron.generate_predesigned_url", return_value=presigned_url), \
             patch("dashboard.cron.process_images_in_batches", return_value=focus_timeline):

            mock_user_logs.objects.update_or_create.return_value = (MagicMock(), True)

            from dashboard.cron import my_scheduled_job
            my_scheduled_job()

            # Only user2 should have update_or_create called
            mock_user_logs.objects.update_or_create.assert_called_once_with(
                email="user2@example.com",
                date="2025-06-10",
                defaults={
                    "staffid": "S2",
                    "jsonlog": focus_timeline
                }
            )

    @pytest.mark.edge_case
    def test_generate_predesigned_url_returns_none(self, mock_user_logs):
        """
        Test that my_scheduled_job skips images if generate_predesigned_url returns None.
        """
        user = {"email": "user1@example.com", "staffid": "S1"}
        image_url = {"Key": "img1.jpg"}
        all_data = {"image_urls": [image_url]}

        with patch("dashboard.cron.get_all_user", return_value=[user]), \
             patch("dashboard.cron.scan_and_download_screenshots", return_value=all_data), \
             patch("dashboard.cron.generate_predesigned_url", return_value=None) as mock_presign, \
             patch("dashboard.cron.process_images_in_batches") as mock_process:

            from dashboard.cron import my_scheduled_job
            my_scheduled_job()

            mock_presign.assert_called_once_with("ddsfocustime", "img1.jpg")
            mock_process.assert_called_once_with([], 80)
            assert not mock_user_logs.objects.update_or_create.called

    @pytest.mark.edge_case
    def test_image_processing_raises_exception(self, mock_user_logs):
        """
        Test that my_scheduled_job continues processing images if an exception is raised during image processing.
        """
        user = {"email": "user1@example.com", "staffid": "S1"}
        image_urls = [
            {"Key": "img1.jpg"},
            {"Key": "img2.png"}
        ]
        all_data = {"image_urls": image_urls}
        presigned_url = "https://bucket/fake"
        focus_timeline = {"result": "ok"}

        def presign_side_effect(bucket, key):
            if key == "img1.jpg":
                raise Exception("Presign error")
            return presigned_url

        with patch("dashboard.cron.get_all_user", return_value=[user]), \
             patch("dashboard.cron.scan_and_download_screenshots", return_value=all_data), \
             patch("dashboard.cron.generate_predesigned_url", side_effect=presign_side_effect), \
             patch("dashboard.cron.process_images_in_batches", return_value=focus_timeline):

            mock_user_logs.objects.update_or_create.return_value = (MagicMock(), True)

            from dashboard.cron import my_scheduled_job
            my_scheduled_job()

            # Should process img2.png only
            mock_user_logs.objects.update_or_create.assert_called_once()

    @pytest.mark.edge_case
    def test_process_images_in_batches_raises_exception(self, mock_user_logs):
        """
        Test that my_scheduled_job handles exception in process_images_in_batches gracefully.
        """
        user = {"email": "user1@example.com", "staffid": "S1"}
        image_url = {"Key": "img1.jpg"}
        all_data = {"image_urls": [image_url]}
        presigned_url = "https://bucket/img1.jpg"

        with patch("dashboard.cron.get_all_user", return_value=[user]), \
             patch("dashboard.cron.scan_and_download_screenshots", return_value=all_data), \
             patch("dashboard.cron.generate_predesigned_url", return_value=presigned_url), \
             patch("dashboard.cron.process_images_in_batches", side_effect=Exception("Batch error")):

            from dashboard.cron import my_scheduled_job
            # Should not raise, should log and continue
            my_scheduled_job()

            # update_or_create should not be called due to exception before it
            assert not mock_user_logs.objects.update_or_create.called

    @pytest.mark.edge_case
    def test_outermost_exception(self, mock_user_logs):
        """
        Test that my_scheduled_job handles an exception in the outermost try block.
        """
        with patch("dashboard.cron.get_all_user", side_effect=Exception("Fatal error")), \
             patch("dashboard.cron.scan_and_download_screenshots") as mock_scan, \
             patch("dashboard.cron.generate_predesigned_url") as mock_presign, \
             patch("dashboard.cron.process_images_in_batches") as mock_process:

            from dashboard.cron import my_scheduled_job
            # Should not raise, should log and exit
            my_scheduled_job()

            mock_scan.assert_not_called()
            mock_presign.assert_not_called()
            mock_process.assert_not_called()
            assert not mock_user_logs.objects.update_or_create.called