from django.contrib import admin
from .models import CareerSession, CareerMessage, CareerPortfolio


@admin.register(CareerSession)
class CareerSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "status", "ready_for_recommend", "created_at")
    list_filter = ("status", "ready_for_recommend")
    search_fields = ("title", "user__username")


@admin.register(CareerMessage)
class CareerMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "sender", "created_at")
    list_filter = ("sender",)
    search_fields = ("content", "session__title")


@admin.register(CareerPortfolio)
class CareerPortfolioAdmin(admin.ModelAdmin):
    list_display = ("user", "updated_at")

