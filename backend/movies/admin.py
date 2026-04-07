from django.contrib import admin
from .models import WatchlistItem, Favorite, WatchHistory

@admin.register(WatchlistItem)
class WatchlistItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'tmdb_id', 'title', 'media_type', 'status', 'added_at')
    list_filter = ('status', 'media_type', 'user')
    search_fields = ('title', 'name', 'user__username')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'tmdb_id', 'title', 'media_type', 'added_at')
    list_filter = ('media_type', 'user')
    search_fields = ('title', 'name', 'user__username')

@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'tmdb_id', 'title', 'media_type', 'watched_at')
    list_filter = ('media_type', 'user')
    search_fields = ('title', 'name', 'user__username')
