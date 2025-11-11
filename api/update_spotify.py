import os
import json
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from datetime import datetime

# Load .env from parent directory
load_dotenv('../.env')

# Spotify OAuth setup
SPOTIPY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = 'http://localhost:8888/callback'
SCOPE = 'user-read-recently-played'


# Connect to Spotify
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=SPOTIPY_CLIENT_ID,
    client_secret=SPOTIPY_CLIENT_SECRET,
    redirect_uri=SPOTIPY_REDIRECT_URI,
    scope=SCOPE,
    cache_path='../.spotify_cache'
))

# Fetch recently played tracks
print("Fetching Spotify data...")
results = sp.current_user_recently_played(limit=50)
tracks = results.get('items', [])

# Get last 4 unique tracks
recent_tracks = []
seen = set()

for item in tracks:
    track = item['track']
    if track['id'] not in seen and len(recent_tracks) < 4:
        seen.add(track['id'])
        recent_tracks.append({
            'name': track['name'],
            'artist': ', '.join([a['name'] for a in track['artists']]),
            'album': track['album']['name'],
            'image': track['album']['images'][0]['url'] if track['album']['images'] else None,
            'url': track['external_urls']['spotify'],
            'played_at': item['played_at']
        })

# Save to JSON
with open('../recently_played.json', 'w') as file:
    json.dump({'tracks': recent_tracks, 'success': True}, file)

print(f"Updated with {len(recent_tracks)}")
