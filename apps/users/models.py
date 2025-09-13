"""
User Models - Extended user profile for additional registration fields
"""
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Extended user profile model to store additional registration information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    organization_name = models.CharField(max_length=100, blank=True, null=True, help_text="User's organization name")
    country = models.CharField(max_length=50, blank=True, null=True, help_text="User's country")
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="User's phone number")
    date_of_birth = models.DateField(blank=True, null=True, help_text="User's date of birth")
    bio = models.TextField(max_length=500, blank=True, null=True, help_text="User's biography")
    
    # Professional information
    job_title = models.CharField(max_length=100, blank=True, null=True, help_text="User's job title")
    industry = models.CharField(max_length=100, blank=True, null=True, help_text="User's industry")
    experience_level = models.CharField(
        max_length=20, 
        choices=[
            ('junior', 'Junior'),
            ('mid', 'Mid-level'),
            ('senior', 'Senior'),
            ('lead', 'Lead'),
            ('manager', 'Manager'),
            ('director', 'Director'),
            ('executive', 'Executive')
        ],
        blank=True, 
        null=True,
        help_text="User's experience level"
    )
    
    # Additional metadata
    profile_completed = models.BooleanField(default=False, help_text="Whether user has completed their profile")
    email_notifications = models.BooleanField(default=True, help_text="User's email notification preference")
    privacy_level = models.CharField(
        max_length=10,
        choices=[
            ('public', 'Public'),
            ('private', 'Private'),
            ('friends', 'Friends Only')
        ],
        default='private',
        help_text="User's privacy level"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        db_table = 'users_userprofile'

    def __str__(self):
        return f"{self.user.username}'s Profile"

    @property
    def full_name(self):
        """Return user's full name"""
        return f"{self.user.first_name} {self.user.last_name}".strip()

    @property
    def display_name(self):
        """Return display name (full name or username)"""
        full_name = self.full_name
        return full_name if full_name else self.user.username

    def get_completion_percentage(self):
        """Calculate profile completion percentage"""
        fields_to_check = [
            self.user.first_name,
            self.user.last_name,
            self.organization_name,
            self.country,
            self.phone_number,
            self.bio,
            self.job_title,
            self.industry
        ]
        
        filled_fields = sum(1 for field in fields_to_check if field)
        total_fields = len(fields_to_check)
        
        return round((filled_fields / total_fields) * 100, 1)

    def mark_profile_completed(self):
        """Mark profile as completed if essential fields are filled"""
        essential_fields = [
            self.user.first_name,
            self.user.last_name,
            self.organization_name,
            self.country
        ]
        
        if all(essential_fields):
            self.profile_completed = True
            self.save(update_fields=['profile_completed'])


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal to automatically create UserProfile when User is created
    """
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal to automatically save UserProfile when User is saved
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
