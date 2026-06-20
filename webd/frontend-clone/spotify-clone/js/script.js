'use strict';
/* ═══════════════════════════════════════════════════════════════
   SPOTIFY CLONE — Advanced JavaScript
   Features: Shuffle, Repeat (off/all/one), Like (localStorage),
   Song search, Keyboard shortcuts, Toast notifications,
   Drag-to-seek, Volume mute toggle, Duration preload,
   Mini equalizer, Hover time preview on seekbar, Auto-next,
   Greeting by time-of-day, Shortcut help modal, Per-album covers
   ═══════════════════════════════════════════════════════════════ */

// ── State ────────────────────────────────────────────────────────
const audio        = new Audio();
let songs          = [];
let currFolder     = '';
let currIndex      = -1;
let repeatMode     = 0;   // 0=off, 1=all, 2=one
let isShuffled     = false;
let isDragging     = false;
let albumMeta      = {};  // { "songs/ncs": { title, description, artist } }
let manifestData   = null; // cached songs.json
let likedSongs     = JSON.parse(localStorage.getItem('sp_liked') || '[]');

const albumColors = {
    'pop_vibes': '#b33951',
    'lofi_beats': '#2d3e50',
    'classical': '#4a3f35',
    'edm': '#4b2e83'
};

// ── DOM Refs ─────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const playBtn         = $('playBtn');
const playIcon        = $('playIcon');
const prevBtn         = $('prevBtn');
const nextBtn         = $('nextBtn');
const shuffleBtn      = $('shuffleBtn');
const repeatBtn       = $('repeatBtn');
const likeBtn         = $('likeBtn');
const progressTrack   = $('progressTrack');
const progressFill    = $('progressFill');
const progressThumb   = $('progressThumb');
const hoverTime       = $('hoverTime');
const currentTimeEl   = $('currentTime');
const totalTimeEl     = $('totalTime');
const npTitle         = $('npTitle');
const npAlbum         = $('npAlbum');
const npCover         = $('npCover');
const npCoverImg      = $('npCoverImg');
const npCoverEq       = $('npCoverEq');
const volBtn          = $('volBtn');
const volIcon         = $('volIcon');
const volumeSlider    = $('volumeSlider');
const volFill         = $('volFill');
const songList        = $('songList');
const cardGrid        = $('cardGrid');
const songSearchInput = $('songSearchInput');
const globalSearch    = $('globalSearchInput');
const searchClear     = $('searchClear');
const sectionTitle    = $('sectionTitle');
const seeAllBtn       = $('seeAllBtn');
const sidebar         = $('sidebar');
const sidebarOverlay  = $('sidebarOverlay');
const hamburgerBtn    = $('hamburgerBtn');
const sidebarClose    = $('sidebarClose');
const greetingMsg     = $('greetingMsg');
const libraryCount    = $('libraryCount');
const noResults       = $('noResults');
const shortcutModal   = $('shortcutModal');
const shortcutClose   = $('shortcutClose');

// ── Utilities ────────────────────────────────────────────────────
function fmt(s) {
    if (isNaN(s) || s < 0) return '0:00';
    const m   = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, '0');
    return `${m}:${sec}`;
}

const AUDIO_EXTS = /\.(mp3|flac|aac|wav|ogg|m4a|opus)$/i;

function cleanName(raw) {
    return decodeURIComponent(raw)
        .replace(AUDIO_EXTS, '')
        .replace(/_/g, ' ')
        .replace(/%20/g, ' ')
        .trim();
}

function toast(msg, dur = 2600) {
    const wrap = $('toastContainer');
    const el   = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 280);
    }, dur);
}

function setGreeting() {
    const h = new Date().getHours();
    if (h < 12)      greetingMsg.textContent = 'Good morning';
    else if (h < 18) greetingMsg.textContent = 'Good afternoon';
    else             greetingMsg.textContent = 'Good evening';
}

// ── Fetch & Build Song List ──────────────────────────────────────
function getSongs(folder) {
    currFolder = folder;
    try {
        // Look up songs from pre-loaded manifest (works on any static host)
        const folderName = folder.split('/').pop();
        const album = manifestData?.albums?.find(a => a.folder === folderName);
        songs = album ? [...(album.songs || [])] : [];
        renderSongList();
        return songs;
    } catch (e) {
        console.error('getSongs failed:', e);
        return [];
    }
}

function renderSongList(filter = '') {
    const meta     = albumMeta[currFolder] || {};
    const filtered = filter
        ? songs.filter(s => cleanName(s).toLowerCase().includes(filter.toLowerCase()))
        : songs;

    libraryCount.textContent = `${filtered.length} song${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        songList.innerHTML = `<li style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px;">No songs found</li>`;
        return;
    }

    const encFld   = currFolder.split('/').map(encodeURIComponent).join('/');
    const coverUrl = `/${encFld}/cover.jpg`;

    songList.innerHTML = filtered.map(song => {
        const idx     = songs.indexOf(song);
        const name    = cleanName(song);
        const liked   = likedSongs.includes(song);
        const isActive = idx === currIndex;
        const isPaused = isActive && audio.paused;

        return `
        <li data-idx="${idx}"
            class="${isActive ? 'active' : ''} ${isPaused ? 'paused' : ''} ${liked ? 'liked' : ''}">
            <div class="s-thumb">
                <img class="cover-mini" src="${coverUrl}"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                     alt="">
                <img src="img/music.svg" alt="" style="display:none; position:absolute; width:18px; height:18px; filter: brightness(0) invert(0.4); top:50%; left:50%; transform:translate(-50%,-50%);">
                <div class="eq-bars">
                    <span></span><span></span><span></span><span></span>
                </div>
            </div>
            <div class="s-meta">
                <div class="s-name">${name}</div>
                <div class="s-artist">${meta.artist || 'Unknown Artist'}</div>
            </div>
            <span class="s-liked">♥</span>
            <span class="s-duration" data-file="${song}">—</span>
        </li>`;
    }).join('');

    songList.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => playAt(parseInt(li.dataset.idx)));
    });

    lazyLoadDurations(filtered);
}

function lazyLoadDurations(list) {
    list.forEach(song => {
        const el = songList.querySelector(`.s-duration[data-file="${CSS.escape(song)}"]`);
        if (!el || el.textContent !== '—') return;
        const tmp = new Audio();
        const encFolder = currFolder.split('/').map(encodeURIComponent).join('/');
        tmp.src = `${encFolder}/${encodeURIComponent(song)}`;
        tmp.addEventListener('loadedmetadata', () => {
            if (el) el.textContent = fmt(tmp.duration);
        });
    });
}

// ── Playback ─────────────────────────────────────────────────────
function playAt(idx, autoplay = true) {
    if (idx < 0 || idx >= songs.length) return;
    currIndex   = idx;
    const song  = songs[idx];
    const encFolder = currFolder.split('/').map(encodeURIComponent).join('/');
    audio.src   = `${encFolder}/${encodeURIComponent(song)}`;

    if (autoplay) {
        audio.play().catch(() => toast('⚠️ Could not autoplay — click play'));
        setPlayState(true);
    }

    updateNowPlaying(song);
    updateActiveSong();
    updateLikeBtn();
}

function setPlayState(playing) {
    playIcon.src = playing ? 'img/pause.svg' : 'img/play.svg';
    playBtn.classList.toggle('is-playing', playing);

    // Show / hide equalizer on NP cover
    if (playing) {
        npCoverEq.style.display = 'flex';
    } else {
        npCoverEq.style.display = 'none';
    }

    // Pause eq bars in sidebar
    document.querySelectorAll('.song-list li.active').forEach(li => {
        li.classList.toggle('paused', !playing);
    });
}

function updateNowPlaying(song) {
    const name     = cleanName(song);
    const meta     = albumMeta[currFolder] || {};
    npTitle.textContent = name;
    npAlbum.textContent = meta.title || currFolder.split('/').pop() || '—';

    // Try to set cover image
    const encF     = currFolder.split('/').map(encodeURIComponent).join('/');
    const coverUrl = `${encF}/cover.jpg`;
    const img      = new Image();
    img.onload = () => {
        npCoverImg.src = coverUrl;
        npCoverImg.style.objectFit = 'cover';
        npCover.classList.remove('icon-mode');
    };
    img.onerror = () => {
        npCoverImg.src = 'img/music.svg';
        npCover.classList.add('icon-mode');
    };
    img.src = coverUrl;
}

function updateActiveSong() {
    songList.querySelectorAll('li').forEach(li => {
        const idx = parseInt(li.dataset.idx);
        li.classList.toggle('active', idx === currIndex);
        li.classList.toggle('paused', idx === currIndex && audio.paused);
    });
}

function updateLikeBtn() {
    const song   = songs[currIndex];
    const liked  = song && likedSongs.includes(song);
    likeBtn.classList.toggle('liked', !!liked);
}

// ── Auto-next helpers ────────────────────────────────────────────
function playNext() {
    if (repeatMode === 2) {        // Repeat one
        audio.currentTime = 0;
        audio.play();
        return;
    }
    let next = currIndex + 1;
    if (isShuffled) {
        next = Math.floor(Math.random() * songs.length);
        while (next === currIndex && songs.length > 1) {
            next = Math.floor(Math.random() * songs.length);
        }
    }
    if (next < songs.length) {
        playAt(next);
    } else if (repeatMode === 1) { // Repeat all
        playAt(0);
    } else {
        setPlayState(false);       // Stop at end
    }
}

function playPrev() {
    if (audio.currentTime > 3) {
        audio.currentTime = 0;     // Restart if > 3 sec in
        return;
    }
    const prev = currIndex - 1;
    if (prev >= 0) {
        playAt(prev);
    } else if (repeatMode === 1) {
        playAt(songs.length - 1);
    }
}

// ── Albums ───────────────────────────────────────────────────────
async function displayAlbums() {
    try {
        // Fetch the static manifest — works on any host, no directory listing needed
        const res = await fetch('songs/songs.json');
        if (!res.ok) throw new Error(`songs.json not found (${res.status})`);
        manifestData = await res.json();

        const albums = manifestData.albums || [];
        cardGrid.innerHTML = '';   // Remove skeletons

        if (albums.length === 0) {
            cardGrid.innerHTML = `<div style="color:var(--text-muted);grid-column:1/-1;padding:40px;text-align:center;font-size:14px;">
                No albums found. Run <code>generate-songs-json.ps1</code> to create your manifest.
            </div>`;
            return;
        }

        for (const album of albums) {
            const key      = `songs/${album.folder}`;
            albumMeta[key] = { title: album.title, description: album.description, artist: album.artist };

            const encFolder = album.folder.split('/').map(encodeURIComponent).join('/');

            const card = document.createElement('div');
            card.className      = 'card';
            card.dataset.folder = album.folder;
            card.innerHTML = `
                <div class="card-cover">
                    <img
                        src="songs/${encFolder}/cover.jpg"
                        alt="${album.title}"
                        onerror="
                            this.src='img/music.svg';
                            this.style.cssText='object-fit:contain;padding:32px;opacity:.25;background:var(--bg-hover)';
                        ">
                    <div class="card-play-overlay">
                        <div class="card-play-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5 3l14 9-14 9V3z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="card-title">${album.title}</div>
                <div class="card-desc">${album.description}</div>
            `;

            card.addEventListener('click', () => {
                sectionTitle.textContent = album.title;
                seeAllBtn.style.display  = 'block';
                songs = getSongs(`songs/${album.folder}`);
                
                // Dynamic background
                const color = albumColors[album.folder] || '#1a2035';
                $('mainContent').style.background = `linear-gradient(180deg, ${color} 0%, #0f1520 25%, var(--bg-elevated) 55%)`;

                if (songs.length) playAt(0);
                window.scrollTo?.(0, 0);
            });

            cardGrid.appendChild(card);
        }
    } catch (e) {
        console.error('displayAlbums failed:', e);
        cardGrid.innerHTML = `<div style="color:var(--text-muted);grid-column:1/-1;padding:40px;text-align:center;font-size:14px;">
            ⚠️ Could not load songs.json. Run <code>generate-songs-json.ps1</code> first.
        </div>`;
    }
}

// ── Progress Bar ─────────────────────────────────────────────────
audio.addEventListener('timeupdate', () => {
    if (!isDragging && audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        updateProgress(pct);
        currentTimeEl.textContent = fmt(audio.currentTime);
        totalTimeEl.textContent   = fmt(audio.duration);
    }
});

function updateProgress(pct) {
    progressFill.style.width  = pct + '%';
    progressThumb.style.left  = pct + '%';
}

function seekTo(clientX) {
    const rect = progressTrack.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    updateProgress(pct * 100);
    if (audio.duration) audio.currentTime = pct * audio.duration;
}

// Click seek
progressTrack.addEventListener('click', e => seekTo(e.clientX));

// Hover time preview
progressTrack.addEventListener('mousemove', e => {
    const rect  = progressTrack.getBoundingClientRect();
    const pct   = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const timeSec = pct * (audio.duration || 0);
    hoverTime.textContent  = fmt(timeSec);
    hoverTime.style.left   = (pct * 100) + '%';
});

// Drag seek
progressTrack.addEventListener('mousedown', e => {
    isDragging = true;
    seekTo(e.clientX);
    const onMove = e2 => { if (isDragging) seekTo(e2.clientX); };
    const onUp   = ()  => { isDragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
});

// Touch seek
progressTrack.addEventListener('touchstart', e => {
    isDragging = true;
    seekTo(e.touches[0].clientX);
}, { passive: true });
progressTrack.addEventListener('touchmove', e => {
    if (isDragging) seekTo(e.touches[0].clientX);
}, { passive: true });
progressTrack.addEventListener('touchend', () => { isDragging = false; });

// ── Controls ─────────────────────────────────────────────────────
playBtn.addEventListener('click', () => {
    if (!songs.length) return;
    if (audio.paused) { audio.play(); setPlayState(true); }
    else              { audio.pause(); setPlayState(false); }
});

prevBtn.addEventListener('click', playPrev);
nextBtn.addEventListener('click', playNext);
audio.addEventListener('ended', playNext);

// Shuffle
shuffleBtn.addEventListener('click', () => {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
    toast(isShuffled ? '🔀 Shuffle on' : '🔀 Shuffle off');
});

// Repeat cycle: off → all → one → off
const REPEAT_ICONS = [
    // 0 = off
    `<path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    // 1 = all (same icon, just active colour)
    `<path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    // 2 = one (add "1" badge via a text element)
    `<path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
     <text x="12" y="14" text-anchor="middle" fill="currentColor" font-size="7" font-weight="bold" font-family="sans-serif">1</text>`
];
const REPEAT_LABELS = ['Repeat off', 'Repeat all', 'Repeat one'];

repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.querySelector('.repeat-icon').innerHTML = REPEAT_ICONS[repeatMode];
    repeatBtn.classList.toggle('active', repeatMode > 0);
    repeatBtn.title = REPEAT_LABELS[repeatMode] + ' (R)';
    toast(`🔁 ${REPEAT_LABELS[repeatMode]}`);
});

// Like
likeBtn.addEventListener('click', () => {
    const song = songs[currIndex];
    if (!song) return;
    const i = likedSongs.indexOf(song);
    if (i === -1) {
        likedSongs.push(song);
        toast('❤️ Added to liked songs');
    } else {
        likedSongs.splice(i, 1);
        toast('🩶 Removed from liked songs');
    }
    localStorage.setItem('sp_liked', JSON.stringify(likedSongs));
    updateLikeBtn();
    renderSongList(songSearchInput.value);
});

// ── Volume ───────────────────────────────────────────────────────
function setVolume(v) {
    audio.volume      = Math.max(0, Math.min(1, v));
    volumeSlider.value = audio.volume * 100;
    volFill.style.width = (audio.volume * 100) + '%';
    volIcon.src = audio.volume === 0 ? 'img/mute.svg' : 'img/volume.svg';
}

setVolume(0.7);

volumeSlider.addEventListener('input', () => setVolume(volumeSlider.value / 100));

volBtn.addEventListener('click', () => {
    if (audio.volume > 0) {
        audio._prevVol = audio.volume;
        setVolume(0);
    } else {
        setVolume(audio._prevVol || 0.7);
    }
});

// ── Sidebar / Mobile ─────────────────────────────────────────────
function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('visible');
}
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('visible');
}
hamburgerBtn.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

// ── Search ───────────────────────────────────────────────────────
songSearchInput.addEventListener('input', e => {
    renderSongList(e.target.value);
});

// Global search (filters cards)
globalSearch.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    searchClear.style.display = q ? 'block' : 'none';

    const cards = cardGrid.querySelectorAll('.card:not(.skeleton)');
    let visible = 0;
    cards.forEach(c => {
        const title = (c.querySelector('.card-title')?.textContent || '').toLowerCase();
        const desc  = (c.querySelector('.card-desc')?.textContent  || '').toLowerCase();
        const match = !q || title.includes(q) || desc.includes(q);
        c.style.display = match ? '' : 'none';
        if (match) visible++;
    });

    noResults.classList.toggle('hidden', visible > 0 || !q);
    sectionTitle.textContent = q ? `Results for "${e.target.value}"` : 'Featured Playlists';
    seeAllBtn.style.display  = q ? 'none' : (currFolder ? 'block' : 'none');
});

searchClear.addEventListener('click', () => {
    globalSearch.value        = '';
    searchClear.style.display = 'none';
    globalSearch.dispatchEvent(new Event('input'));
    globalSearch.focus();
});

// ── See All ──────────────────────────────────────────────────────
seeAllBtn.addEventListener('click', async () => {
    sectionTitle.textContent = 'Featured Playlists';
    seeAllBtn.style.display  = 'none';
    // Re-show all cards
    cardGrid.querySelectorAll('.card').forEach(c => c.style.display = '');
    noResults.classList.add('hidden');
    $('mainContent').style.background = ''; // reset to default CSS
});

// ── Keyboard Shortcuts ───────────────────────────────────────────
document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    switch (e.key) {
        case ' ':
            e.preventDefault();
            playBtn.click();
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (e.shiftKey) nextBtn.click();
            else audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (e.shiftKey) prevBtn.click();
            else audio.currentTime = Math.max(0, audio.currentTime - 5);
            break;
        case 'ArrowUp':
            e.preventDefault();
            setVolume(audio.volume + 0.05);
            break;
        case 'ArrowDown':
            e.preventDefault();
            setVolume(audio.volume - 0.05);
            break;
        case 'm': case 'M':
            volBtn.click();
            break;
        case 's': case 'S':
            shuffleBtn.click();
            break;
        case 'r': case 'R':
            repeatBtn.click();
            break;
        case 'l': case 'L':
            likeBtn.click();
            break;
        case '?':
            shortcutModal.classList.remove('hidden');
            break;
    }
});

shortcutClose.addEventListener('click', () => shortcutModal.classList.add('hidden'));
shortcutModal.addEventListener('click', e => {
    if (e.target === shortcutModal) shortcutModal.classList.add('hidden');
});

// ── Init ──────────────────────────────────────────────────
async function main() {
    setGreeting();

    // Load all albums first (populates manifestData)
    await displayAlbums();

    // Silently queue the first album that actually has songs
    const firstWithSongs = manifestData?.albums?.find(a => a.songs?.length > 0);
    if (firstWithSongs) {
        songs = getSongs(`songs/${firstWithSongs.folder}`);
        if (songs.length) {
            playAt(0, false);
            setPlayState(false);
        }
    }

    // Welcome toast with shortcut hint
    setTimeout(() => toast('⌨️ Press ? to see keyboard shortcuts', 3500), 800);
}

main();
