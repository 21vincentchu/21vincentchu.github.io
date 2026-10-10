"""Refresh music.json (the Fun page's On Rotation section and listening stats) from Spotify.

Pulls your top artists and top tracks for three time ranges and works out the
stats the charts show, so the page only has to draw them.

    cd api && python3 update_spotify.py

Needs SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in the environment or in ../.env.
The first run opens a browser to log in to Spotify; after that the token is
cached in ../.spotify_cache (gitignored).
"""
import json
import os
import statistics
from collections import Counter
from datetime import date, datetime, timezone

import spotipy
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)

load_dotenv(os.path.join(SITE, '..', '.env'))

# Must match a redirect URI registered on the Spotify app (shared with spotify-music-app)
REDIRECT_URI = 'http://127.0.0.1:8000/callback'
SCOPE = 'user-top-read'
TIME_RANGE = 'short_term'  # ~4 weeks; drives the On Rotation rows
COUNT = 20  # Spotify allows up to 50; the page shows 8 per row until "Show all"

# Tracks to leave off the site (it's still a professional-ish page) - match on title, lowercase
SKIP_TRACKS = {
    'bitches talk shit',
    'sex',
}

# Artists to leave off the site, matched on name, lowercase (applies to rows and stats)
SKIP_ARTISTS = {
    'whoring',
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


print('Fetching top artists and tracks (4 weeks, 6 months, ~1 year)...')
RANGES = ('short_term', 'medium_term', 'long_term')
top_artists = {
    r: [a for a in sp.current_user_top_artists(limit=50, time_range=r)['items'] if a['name'].lower() not in SKIP_ARTISTS]
    for r in RANGES
}
top_tracks = {r: sp.current_user_top_tracks(limit=50, time_range=r)['items'] for r in RANGES}

# ---------- On Rotation rows ----------
artists = [
    {
        'name': a['name'],
        'image': image_of(a['images']),
        'url': a['external_urls']['spotify'],
    }
    for a in top_artists[TIME_RANGE][:COUNT]
]

tracks = []
for t in top_tracks[TIME_RANGE]:
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

# ---------- Stats for the charts ----------
# Genres and popularity use the ~6 month list: steadier than 4 weeks, fresher than a year
stat_artists = top_artists['medium_term']

genre_counts = Counter(g for a in stat_artists for g in set(a.get('genres') or []))
genres = [{'genre': g, 'artists': n} for g, n in genre_counts.most_common(8)]

popularity = sorted(
    ({'name': a['name'], 'popularity': a['popularity']} for a in stat_artists if a.get('popularity') is not None),
    key=lambda a: a['popularity'],
)

# Rising / fading: compare this month's ranks with the ~1 year ranks
rank = {r: {a['id']: i + 1 for i, a in enumerate(top_artists[r])} for r in RANGES}
names = {a['id']: a['name'] for r in RANGES for a in top_artists[r]}
year_size = len(top_artists['long_term'])

rising = []
for aid, now_rank in rank['short_term'].items():
    before = rank['long_term'].get(aid)
    climb = (year_size + 1 if before is None else before) - now_rank
    if now_rank <= 20 and climb >= 10:
        rising.append({'name': names[aid], 'now': now_rank, 'before': before, 'climb': climb})
rising.sort(key=lambda a: (-a['climb'], a['now']))

fading = []
for aid, before in rank['long_term'].items():
    now_rank = rank['short_term'].get(aid)
    if before <= 15 and (now_rank is None or now_rank - before >= 10):
        fading.append({'name': names[aid], 'now': now_rank, 'before': before})
fading.sort(key=lambda a: a['before'])

# Release years and track facts across every top track, each counted once
all_tracks = list({t['id']: t for r in RANGES for t in top_tracks[r]}.values())


def release_year(t):
    try:
        return int(t['album']['release_date'][:4])
    except (KeyError, ValueError, TypeError):
        return None


year_counts = Counter(y for y in map(release_year, all_tracks) if y)
release_years = [{'year': y, 'tracks': year_counts[y]} for y in sorted(year_counts)]

today = date.today()


def released_within_a_year(t):
    d = t['album'].get('release_date', '')
    try:
        released = date.fromisoformat(d) if len(d) == 10 else date(int(d[:4]), 1, 1)
    except ValueError:
        return False
    return (today - released).days <= 365


facts = {
    'tracks_counted': len(all_tracks),
    'artists_counted': len(stat_artists),
    'avg_track_seconds': round(statistics.mean(t['duration_ms'] for t in all_tracks) / 1000) if all_tracks else None,
    'explicit_share': round(sum(t['explicit'] for t in all_tracks) / len(all_tracks), 3) if all_tracks else None,
    'released_last_year_share': round(sum(map(released_within_a_year, all_tracks)) / len(all_tracks), 3) if all_tracks else None,
    'median_artist_popularity': statistics.median(a['popularity'] for a in popularity) if popularity else None,
    'distinct_genres': len(genre_counts),
}

stats = {
    'updated': datetime.now(timezone.utc).strftime('%Y-%m-%d'),
    'facts': facts,
    'genres': genres,
    'popularity': popularity,
    'rising': rising[:6],
    'fading': fading[:6],
    'release_years': release_years,
}

with open(os.path.join(SITE, 'music.json'), 'w', encoding='utf-8') as f:
    json.dump({'artists': artists, 'tracks': tracks, 'stats': stats}, f, indent=4, ensure_ascii=False)
    f.write('\n')

print(f'Wrote {len(artists)} artists, {len(tracks)} tracks and listening stats to music.json')
