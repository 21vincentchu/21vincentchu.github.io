"""Refresh music.json (the Fun page's On Rotation section) from Spotify.

Pulls your top artists and top tracks for the last ~4 weeks.

    cd api && python3 update_spotify.py

Needs SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in the environment or in ../.env.
The first run opens a browser to log in to Spotify; after that the token is
cached in ../.spotify_cache (gitignored).
"""
import json
import os

import spotipy
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)

load_dotenv(os.path.join(SITE, '..', '.env'))

# Must match a redirect URI registered on the Spotify app (shared with spotify-music-app)
REDIRECT_URI = 'http://127.0.0.1:8000/callback'
SCOPE = 'user-top-read'
TIME_RANGE = 'short_term'  # ~4 weeks; 'medium_term' is ~6 months
COUNT = 20  # Spotify allows up to 50; the page shows 8 per row until "Show all"

# Tracks to leave off the site (it's still a professional-ish page) - match on title, lowercase
SKIP_TRACKS = {
    'bitches talk shit',
    'sex',
}

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET'),
    redirect_uri=REDIRECT_URI,
    scope=SCOPE,
    cache_path=os.path.join(SITE, '.spotify_cache'),
))


def image_of(images):
    return images[0]['url'] if images else None


print('Fetching top artists...')
artists = [
    {
        'name': a['name'],
        'image': image_of(a['images']),
        'url': a['external_urls']['spotify'],
    }
    for a in sp.current_user_top_artists(limit=COUNT, time_range=TIME_RANGE)['items']
]

print('Fetching top tracks...')
tracks = []
for t in sp.current_user_top_tracks(limit=50, time_range=TIME_RANGE)['items']:
    if t['name'].lower() in SKIP_TRACKS:
        continue
    tracks.append({
        'title': t['name'],
        'artist': ', '.join(a['name'] for a in t['artists']),
        'image': image_of(t['album']['images']),
        'url': t['external_urls']['spotify'],
    })
    if len(tracks) == COUNT:
        break

with open(os.path.join(SITE, 'music.json'), 'w', encoding='utf-8') as f:
    json.dump({'artists': artists, 'tracks': tracks}, f, indent=4, ensure_ascii=False)
    f.write('\n')

print(f'Wrote {len(artists)} artists and {len(tracks)} tracks to music.json')
