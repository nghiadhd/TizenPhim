// ── API ──────────────────────────────────────────────────────────────────────
const API = 'https://phimapi.com';
const CDN = 'https://phimimg.com';

async function apiFetch(path) {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function fetchList(type, page = 1) {
  const d = await apiFetch(`/v1/api/danh-sach/${type}?page=${page}`);
  return d.data?.items || [];
}

async function fetchDetail(slug) {
  const d = await apiFetch(`/phim/${slug}`);
  return d;
}

async function fetchSearch(keyword) {
  const d = await apiFetch(`/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=20`);
  return d.data?.items || [];
}

function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return CDN + '/' + path.replace(/^\//, '');
}

// ── STATE ────────────────────────────────────────────────────────────────────
const state = {
  screen: 'home',        // home | search | detail | player
  navTab: 'phim-moi',    // current nav tab
  homeRows: [],          // [{ title, items }]
  focusSection: 0,       // which focusable row/group
  focusIndex: 0,         // which item within that group
  rowOffsets: [],        // horizontal scroll offset per row (in cards)
  detail: null,          // current movie detail data
  detailServer: 0,       // selected server index
  episodes: [],          // flat episode list for current server
  currentEp: 0,          // current episode index in player
  hls: null,
  playerVisible: false,
  hideTimer: null,
  movieTitle: '',
};

// ── NAVIGATION ───────────────────────────────────────────────────────────────
const NAV_SECTIONS = {
  home: buildHomeSections,
  search: buildSearchSections,
  detail: buildDetailSections,
  player: buildPlayerSections,
};

// Returns array of arrays of focusable elements for current screen
function getFocusSections() {
  if (state.screen === 'home') return getHomeSections();
  if (state.screen === 'search') return getSearchSections();
  if (state.screen === 'detail') return getDetailSections();
  if (state.screen === 'player') return getPlayerSections();
  return [[]];
}

function getEl(section, index) {
  const sections = getFocusSections();
  if (!sections[section] || !sections[section][index]) return null;
  return sections[section][index];
}

function moveFocus(ds, di) {
  const sections = getFocusSections();
  let ns = state.focusSection + ds;
  let ni = state.focusIndex + di;

  // Clamp section
  if (ns < 0) ns = 0;
  if (ns >= sections.length) ns = sections.length - 1;

  // Clamp index within section
  const row = sections[ns] || [];
  if (ni < 0) ni = 0;
  if (ni >= row.length) ni = row.length - 1;

  if (ns === state.focusSection && ni === state.focusIndex) return;

  setFocus(ns, ni);
}

function setFocus(section, index) {
  // Remove old focus
  document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));

  state.focusSection = section;
  state.focusIndex = index;

  const el = getEl(section, index);
  if (!el) return;
  el.classList.add('focused');
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' });

  // Auto-scroll movie rows
  if (state.screen === 'home' && section >= 2) {
    const rowIdx = section - 2; // row sections start at 2 (0=navbar, 1=nav-items wait, actually varies)
    scrollRowToCard(rowIdx, index);
  }
}

function activate() {
  const el = getEl(state.focusSection, state.focusIndex);
  if (!el) return;

  // Nav items
  if (el.dataset.nav) {
    switchNavTab(el.dataset.nav);
    return;
  }
  // Search button
  if (el.classList.contains('search-btn')) { showSearch(); return; }
  // Back buttons
  if (el.id === 'search-back') { showScreen('home'); return; }
  if (el.id === 'detail-back') { showScreen('home'); return; }
  if (el.id === 'player-back') { stopPlayer(); return; }
  // Movie card
  if (el.classList.contains('movie-card')) { openDetail(el.dataset.slug); return; }
  // Server tab
  if (el.classList.contains('server-tab')) { selectServer(parseInt(el.dataset.server)); return; }
  // Episode button
  if (el.classList.contains('episode-btn')) { playEpisode(parseInt(el.dataset.ep)); return; }
  // Player controls
  if (el.id === 'ctrl-play') { togglePlay(); return; }
  if (el.id === 'ctrl-back10') { seekRel(-10); return; }
  if (el.id === 'ctrl-fwd10') { seekRel(10); return; }
  if (el.id === 'ctrl-prev-ep') { playEpisode(state.currentEp - 1); return; }
  if (el.id === 'ctrl-next-ep') { playEpisode(state.currentEp + 1); return; }
}

// ── KEY HANDLER ──────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const key = e.keyCode;

  // Media remote keys (registered in init)
  if (key === 415 || key === 10252) { togglePlay(); showOverlay(); return; } // MediaPlay / MediaPlayPause
  if (key === 19)  { togglePlay(); showOverlay(); return; }                   // MediaPause
  if (key === 178) { stopPlayer(); return; }                                  // MediaStop
  if (key === 417) { seekRel(30); showOverlay(); return; }                   // MediaFastForward
  if (key === 412) { seekRel(-10); showOverlay(); return; }                  // MediaRewind

  // Player seek with left/right when overlay hidden
  if (state.screen === 'player' && !state.playerVisible) {
    if (key === 37) { seekRel(-10); showOverlay(); return; }
    if (key === 39) { seekRel(10); showOverlay(); return; }
    if (key === 38 || key === 40 || key === 13) { showOverlay(); return; }
    if (key === 8 || key === 461) { stopPlayer(); return; }
  }

  if (state.screen === 'search') {
    if (state.focusSection === 1) {
      // Input focused – let typing happen, handle special keys
      if (key === 8 && document.getElementById('search-input').value === '') {
        showScreen('home'); return;
      }
      if (key === 13) { doSearch(); return; }
      if (key === 38) { setFocus(0, 1); return; }
      return; // pass other keys to input
    }
  }

  switch (key) {
    case 38: moveFocus(-1, 0); break; // Up
    case 40: moveFocus(1, 0); break;  // Down
    case 37: moveFocus(0, -1); break; // Left
    case 39: moveFocus(0, 1); break;  // Right
    case 13: activate(); break;        // Enter
    case 8:                            // Back / Backspace
    case 461:
      goBack();
      break;
  }

  e.preventDefault();
});

function goBack() {
  if (state.screen === 'player') { stopPlayer(); return; }
  if (state.screen === 'detail') { showScreen('home'); return; }
  if (state.screen === 'search') { showScreen('home'); return; }
}

// ── SCREENS ──────────────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(name + '-screen').classList.add('active');
  state.screen = name;
  state.focusSection = 0;
  state.focusIndex = 0;

  requestAnimationFrame(() => {
    const sections = getFocusSections();
    if (sections[0]?.[0]) setFocus(0, 0);
  });
}

// ── HOME SECTIONS ────────────────────────────────────────────────────────────
function getHomeSections() {
  const navItems = [...document.querySelectorAll('#home-screen .nav-item')];
  const searchBtn = document.querySelector('#home-screen .search-btn');
  const rows = [...document.querySelectorAll('.movie-row')];

  const navSection = [...navItems, searchBtn].filter(Boolean);
  const cardRows = rows.map(row => [...row.querySelectorAll('.movie-card')]);

  return [navSection, ...cardRows];
}

function buildHomeSections() {}
function buildSearchSections() {}
function buildDetailSections() {}
function buildPlayerSections() {}

// ── SEARCH SECTIONS ───────────────────────────────────────────────────────────
function getSearchSections() {
  const back = document.getElementById('search-back');
  const input = document.getElementById('search-input');
  const cards = [...document.querySelectorAll('#search-results .movie-card')];
  const row0 = [back, input].filter(Boolean);
  if (cards.length === 0) return [row0];

  // Group cards into rows of 8
  const cardRows = [];
  for (let i = 0; i < cards.length; i += 8) {
    cardRows.push(cards.slice(i, i + 8));
  }
  return [row0, ...cardRows];
}

// ── DETAIL SECTIONS ───────────────────────────────────────────────────────────
function getDetailSections() {
  const back = document.getElementById('detail-back');
  const servers = [...document.querySelectorAll('#server-tabs .server-tab')];
  const eps = [...document.querySelectorAll('#episode-list .episode-btn')];

  const rows = [[back], servers];
  for (let i = 0; i < eps.length; i += 12) {
    rows.push(eps.slice(i, i + 12));
  }
  return rows;
}

// ── PLAYER SECTIONS ───────────────────────────────────────────────────────────
function getPlayerSections() {
  const controls = [
    document.getElementById('ctrl-back10'),
    document.getElementById('ctrl-prev-ep'),
    document.getElementById('ctrl-play'),
    document.getElementById('ctrl-next-ep'),
    document.getElementById('ctrl-fwd10'),
  ].filter(Boolean);
  const back = document.getElementById('player-back');
  return [[back], controls];
}

// ── HOME ─────────────────────────────────────────────────────────────────────
const HOME_TABS = {
  home: [
    { title: 'Phim Mới Cập Nhật', type: 'phim-moi' },
    { title: 'Phim Lẻ', type: 'phim-le' },
    { title: 'Phim Bộ', type: 'phim-bo' },
    { title: 'Hoạt Hình', type: 'hoat-hinh' },
  ],
  'phim-le': [{ title: 'Phim Lẻ', type: 'phim-le' }],
  'phim-bo': [{ title: 'Phim Bộ', type: 'phim-bo' }],
  'hoat-hinh': [{ title: 'Hoạt Hình', type: 'hoat-hinh' }],
};

async function switchNavTab(nav) {
  state.navTab = nav;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === nav);
  });

  const content = document.getElementById('home-content');
  content.innerHTML = '<div class="loading"><div class="spinner"></div>Đang tải...</div>';

  const sections = HOME_TABS[nav] || HOME_TABS.home;
  const allItems = await Promise.all(sections.map(s => fetchList(s.type).catch(() => [])));

  content.innerHTML = '';
  sections.forEach((s, i) => {
    if (!allItems[i]?.length) return;
    content.innerHTML += `
      <div class="section-title">${s.title}</div>
      <div class="row-container">
        <div class="movie-row" id="row-${i}">${allItems[i].map(m => movieCardHtml(m)).join('')}</div>
      </div>`;
  });

  // Re-focus first card
  requestAnimationFrame(() => setFocus(1, 0));
}

function movieCardHtml(m) {
  const thumb = imgUrl(m.thumb_url || m.poster_url);
  const badge = m.quality || m.episode_current || '';
  const year = m.year || '';
  return `<div class="movie-card" data-slug="${m.slug}">
    <img class="card-thumb" src="${thumb}" alt="${m.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 220 310%22><rect fill=%22%231c1c28%22 width=%22220%22 height=%22310%22/></svg>'">
    ${badge ? `<div class="card-badge">${badge}</div>` : ''}
    <div class="card-info">
      <div class="card-name">${m.name}</div>
      <div class="card-meta">${[m.origin_name, year].filter(Boolean).join(' · ')}</div>
    </div>
  </div>`;
}

function scrollRowToCard(rowIdx, cardIdx) {
  const row = document.querySelectorAll('.movie-row')[rowIdx];
  if (!row) return;
  const card = row.querySelectorAll('.movie-card')[cardIdx];
  if (!card) return;
  card.scrollIntoView({ inline: 'nearest', block: 'nearest' });
}

// ── SEARCH ───────────────────────────────────────────────────────────────────
function showSearch() {
  showScreen('search');
  requestAnimationFrame(() => {
    setFocus(0, 1); // focus input
    document.getElementById('search-input').focus();
    document.getElementById('search-input').classList.add('focused');
    document.querySelector('.search-input-wrap').classList.add('focused');
  });
}

let searchTimer = null;
document.getElementById('search-input').addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(doSearch, 600);
});

async function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  const results = document.getElementById('search-results');
  results.innerHTML = '<div class="loading"><div class="spinner"></div>Đang tìm...</div>';
  try {
    const items = await fetchSearch(q);
    if (!items.length) {
      results.innerHTML = '<div style="color:var(--text2);font-size:24px;width:100%;text-align:center;padding-top:40px">Không tìm thấy kết quả</div>';
      return;
    }
    results.innerHTML = items.map(m => movieCardHtml(m)).join('');
    requestAnimationFrame(() => setFocus(1, 0));
  } catch {
    results.innerHTML = '<div style="color:var(--text2);font-size:24px;width:100%;text-align:center;padding-top:40px">Lỗi tìm kiếm</div>';
  }
}

// ── DETAIL ───────────────────────────────────────────────────────────────────
async function openDetail(slug) {
  showScreen('detail');
  document.getElementById('detail-title').textContent = 'Đang tải...';
  document.getElementById('detail-desc').textContent = '';
  document.getElementById('server-tabs').innerHTML = '';
  document.getElementById('episode-list').innerHTML = '';

  try {
    const data = await fetchDetail(slug);
    state.detail = data;
    renderDetail(data);
  } catch (e) {
    toast('Lỗi tải thông tin phim');
  }
}

function renderDetail(data) {
  const m = data.movie;
  state.movieTitle = m.name;

  // Poster & backdrop
  const poster = imgUrl(m.poster_url || m.thumb_url);
  document.getElementById('detail-poster-img').src = poster;
  document.getElementById('detail-backdrop').style.backgroundImage = `url(${poster})`;

  document.getElementById('detail-title').textContent = m.name;
  document.getElementById('detail-origin').textContent = m.origin_name || '';
  document.getElementById('detail-desc').textContent = m.content?.replace(/<[^>]+>/g, '') || '';

  // Tags
  const tags = [];
  if (m.quality) tags.push(`<span class="tag quality">${m.quality}</span>`);
  if (m.lang) tags.push(`<span class="tag">${m.lang}</span>`);
  if (m.year) tags.push(`<span class="tag">${m.year}</span>`);
  if (m.time) tags.push(`<span class="tag">${m.time}</span>`);
  (m.category || []).slice(0, 3).forEach(c => tags.push(`<span class="tag">${c.name}</span>`));
  document.getElementById('detail-tags').innerHTML = tags.join('');

  // Servers
  const servers = data.episodes || [];
  const tabsEl = document.getElementById('server-tabs');
  tabsEl.innerHTML = servers.map((s, i) =>
    `<div class="server-tab ${i === 0 ? 'active' : ''}" data-server="${i}">${s.server_name}</div>`
  ).join('');

  selectServer(0);
  requestAnimationFrame(() => setFocus(0, 0));
}

function selectServer(idx) {
  const servers = state.detail?.episodes || [];
  if (!servers[idx]) return;
  state.detailServer = idx;
  state.episodes = servers[idx].server_data || [];

  document.querySelectorAll('.server-tab').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  const listEl = document.getElementById('episode-list');
  if (state.episodes.length === 1 && state.episodes[0].name === 'Full') {
    listEl.innerHTML = `<div class="episode-btn" data-ep="0">▶ Xem Phim</div>`;
  } else {
    listEl.innerHTML = state.episodes.map((ep, i) =>
      `<div class="episode-btn" data-ep="${i}">${ep.name}</div>`
    ).join('');
  }
}

// ── PLAYER ───────────────────────────────────────────────────────────────────
function playEpisode(idx) {
  if (idx < 0 || idx >= state.episodes.length) {
    toast('Không có tập này');
    return;
  }
  state.currentEp = idx;
  const ep = state.episodes[idx];
  const url = ep.link_m3u8;
  if (!url) { toast('Không có link stream'); return; }

  showScreen('player');
  document.getElementById('player-title').textContent = state.movieTitle;
  document.getElementById('player-ep').textContent = ep.name === 'Full' ? '' : 'Tập ' + ep.name;

  const video = document.getElementById('player-video');
  if (state.hls) { state.hls.destroy(); state.hls = null; }

  if (Hls.isSupported()) {
    const hls = new Hls({ enableWorker: false });
    state.hls = hls;
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) toast('Lỗi phát video: ' + data.type);
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.play();
  } else {
    toast('Trình duyệt không hỗ trợ HLS');
    return;
  }

  video.addEventListener('timeupdate', updateProgress);
  showOverlay();
  setFocus(1, 2); // focus play button
}

function togglePlay() {
  const video = document.getElementById('player-video');
  if (video.paused) { video.play(); document.getElementById('ctrl-play').textContent = '⏸'; }
  else { video.pause(); document.getElementById('ctrl-play').textContent = '▶'; }
}

function seekRel(secs) {
  const video = document.getElementById('player-video');
  video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + secs));
}

function updateProgress() {
  const video = document.getElementById('player-video');
  const pct = video.duration ? (video.currentTime / video.duration * 100) : 0;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('player-time').textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;

  // Auto next episode near end
  if (video.duration && video.currentTime >= video.duration - 5) {
    if (state.currentEp < state.episodes.length - 1) {
      playEpisode(state.currentEp + 1);
    }
  }
}

function fmt(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function showOverlay() {
  const overlay = document.getElementById('player-overlay');
  overlay.classList.add('visible');
  state.playerVisible = true;
  clearTimeout(state.hideTimer);
  state.hideTimer = setTimeout(() => {
    overlay.classList.remove('visible');
    state.playerVisible = false;
  }, 4000);
}

function stopPlayer() {
  const video = document.getElementById('player-video');
  video.pause();
  video.src = '';
  if (state.hls) { state.hls.destroy(); state.hls = null; }
  clearTimeout(state.hideTimer);
  showScreen('detail');
}

// ── TOAST ────────────────────────────────────────────────────────────────────
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ── INIT ─────────────────────────────────────────────────────────────────────
(async function init() {
  // Register Tizen keys if available
  try {
    if (window.tizen?.tvinputdevice) {
      tizen.tvinputdevice.registerKey('MediaPlayPause');
      tizen.tvinputdevice.registerKey('MediaStop');
      tizen.tvinputdevice.registerKey('MediaFastForward');
      tizen.tvinputdevice.registerKey('MediaRewind');
    }
  } catch (_) {}

  // Delegate click on dynamic cards
  document.addEventListener('click', e => {
    const card = e.target.closest('.movie-card');
    if (card) { openDetail(card.dataset.slug); return; }
    const ep = e.target.closest('.episode-btn');
    if (ep) { playEpisode(parseInt(ep.dataset.ep)); return; }
    const tab = e.target.closest('.server-tab');
    if (tab) { selectServer(parseInt(tab.dataset.server)); return; }
    const nav = e.target.closest('.nav-item');
    if (nav) { switchNavTab(nav.dataset.nav); return; }
    if (e.target.closest('.search-btn')) { showSearch(); return; }
    if (e.target.closest('#detail-back')) { showScreen('home'); return; }
    if (e.target.closest('#search-back')) { showScreen('home'); return; }
    if (e.target.closest('#player-back')) { stopPlayer(); return; }
    if (e.target.closest('#ctrl-play')) { togglePlay(); return; }
    if (e.target.closest('#ctrl-back10')) { seekRel(-10); return; }
    if (e.target.closest('#ctrl-fwd10')) { seekRel(10); return; }
    if (e.target.closest('#ctrl-prev-ep')) { playEpisode(state.currentEp - 1); return; }
    if (e.target.closest('#ctrl-next-ep')) { playEpisode(state.currentEp + 1); return; }
  });

  await switchNavTab('home');
})();
