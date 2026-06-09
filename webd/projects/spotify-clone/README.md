# 🎵 Spotify Clone — Setup Guide

## Folder Structure

```
SpotifyClone/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── img/
│   ├── logo.svg
│   ├── home.svg
│   ├── search.svg
│   ├── playlist.svg
│   ├── music.svg
│   ├── play.svg
│   ├── pause.svg
│   ├── prevsong.svg
│   ├── nextsong.svg
│   ├── volume.svg
│   ├── mute.svg
│   ├── hamburger.svg
│   ├── close.svg
│   └── favicon.ico
└── songs/
    ├── ncs/
    │   ├── info.json       ← required
    │   ├── cover.jpg       ← album art (optional but recommended)
    │   ├── song1.mp3
    │   └── song2.mp3
    ├── Angry_(mood)/
    │   ├── info.json
    │   ├── cover.jpg
    │   └── *.mp3
    ├── Bright_(mood)/
    │   ├── info.json
    │   ├── cover.jpg
    │   └── *.mp3
    ├── Chill_(mood)/
    ├── Dark_(mood)/
    ├── Diljit/
    ├── Funky_(mood)/
    ├── karan_aujla/
    ├── Love_(mood)/
    └── Uplifting_(mood)/
```

## info.json format (each album folder must have one)

```json
{
    "title": "NCS Mix",
    "description": "Non-Copyrighted Songs for creators",
    "artist": "Various Artists"
}
```

## How to run

This project requires a local HTTP server (can't open index.html directly as a file).

### Option 1 — VS Code Live Server (easiest)
1. Open the `SpotifyClone` folder in VS Code
2. Right-click `index.html` → "Open with Live Server"

### Option 2 — Python
```bash
cd SpotifyClone
python -m http.server 3000
# Open http://localhost:3000
```

### Option 3 — Node.js (npx)
```bash
cd SpotifyClone
npx serve .
# Open the URL shown
```

## Features

| Feature | How |
|---|---|
| Play / Pause | Click ▶ or press **Space** |
| Previous | Click ⏮ or **Shift + ←** |
| Next | Click ⏭ or **Shift + →** |
| Seek ±5 sec | **← / →** arrow keys |
| Volume up/down | **↑ / ↓** arrow keys |
| Mute | Click 🔊 or press **M** |
| Shuffle | Click ⇌ or press **S** |
| Repeat (off/all/one) | Click 🔁 or press **R** |
| Like song | Click ♥ or press **L** |
| Search albums | Top search bar |
| Search songs in playlist | Sidebar search field |
| Keyboard shortcuts help | Press **?** |

## Where to add your MP3s

Drop your `.mp3` files into the correct sub-folder under `songs/`. 
Each folder must also have:
- `info.json` — title, description, artist
- `cover.jpg` — album artwork (any square image works)

Songs are loaded automatically when you click an album card.
