'use strict';

// Dev: ?sim=tizen forces Tizen code path in desktop browser
if (new URLSearchParams(location.search).get('sim') === 'tizen') window.tizen = window.tizen || {};

// ── Config ────────────────────────────────────────────────────────────────────
const VERSION = '1.0.1';
const API     = 'https://phimapi.com';
const CDN     = 'https://phimimg.com';

// ── Catalogs ──────────────────────────────────────────────────────────────────
// path: API path suffix. Items parsed from .data.items or .items (both handled).
const CATALOG_PATHS = {
  'phim-moi':             '/danh-sach/phim-moi-cap-nhat',
  'phim-le':              '/v1/api/danh-sach/phim-le',
  'phim-bo':              '/v1/api/danh-sach/phim-bo',
  'hoat-hinh':            '/v1/api/danh-sach/hoat-hinh',
  'tv-shows':             '/v1/api/danh-sach/tv-shows',
  'hanh-dong':            '/v1/api/the-loai/hanh-dong',
  'tinh-cam':             '/v1/api/the-loai/tinh-cam',
  'hai-huoc':             '/v1/api/the-loai/hai-huoc',
  'kinh-di':              '/v1/api/the-loai/kinh-di',
  'tam-ly':               '/v1/api/the-loai/tam-ly',
  'hinh-su':              '/v1/api/the-loai/hinh-su',
  'co-trang':             '/v1/api/the-loai/co-trang',
  'than-thoai':           '/v1/api/the-loai/than-thoai',
  'chien-tranh':          '/v1/api/the-loai/chien-tranh',
  'hoc-duong':            '/v1/api/the-loai/hoc-duong',
  'phieu-luu':            '/v1/api/the-loai/phieu-luu',
  'bi-an':                '/v1/api/the-loai/bi-an',
  'lich-su':              '/v1/api/the-loai/lich-su',
  'vien-tuong':           '/v1/api/the-loai/vien-tuong',
  'vo-thuat':             '/v1/api/the-loai/vo-thuat',
  'gia-dinh':             '/v1/api/the-loai/gia-dinh',
  'the-thao':             '/v1/api/the-loai/the-thao',
  'am-nhac':              '/v1/api/the-loai/am-nhac',
  'au-my':                '/v1/api/quoc-gia/au-my',
  'han-quoc':             '/v1/api/quoc-gia/han-quoc',
  'trung-quoc':           '/v1/api/quoc-gia/trung-quoc',
  'nhat-ban':             '/v1/api/quoc-gia/nhat-ban',
  'thai-lan':             '/v1/api/quoc-gia/thai-lan',
  'viet-nam':             '/v1/api/quoc-gia/viet-nam',
};

const CATALOGS = [
  { id: 'search',     name: 'Tìm Kiếm',     local: true },
  { id: 'continue',   name: 'Đang Xem',     local: true },
  { id: 'phim-moi',   name: 'Phim Mới' },
  { id: 'phim-le',    name: 'Phim Lẻ' },
  { id: 'phim-bo',    name: 'Phim Bộ' },
  { id: 'hoat-hinh',  name: 'Hoạt Hình' },
  { id: 'tv-shows',   name: 'TV Shows' },
  { id: 'hanh-dong',  name: 'Hành Động' },
  { id: 'tinh-cam',   name: 'Tình Cảm' },
  { id: 'hai-huoc',   name: 'Hài Hước' },
  { id: 'kinh-di',    name: 'Kinh Dị' },
  { id: 'tam-ly',     name: 'Tâm Lý' },
  { id: 'hinh-su',    name: 'Hình Sự' },
  { id: 'co-trang',   name: 'Cổ Trang' },
  { id: 'than-thoai', name: 'Thần Thoại' },
  { id: 'chien-tranh',name: 'Chiến Tranh' },
  { id: 'hoc-duong',  name: 'Học Đường' },
  { id: 'phieu-luu',  name: 'Phiêu Lưu' },
  { id: 'bi-an',      name: 'Bí Ẩn' },
  { id: 'lich-su',    name: 'Lịch Sử' },
  { id: 'vien-tuong', name: 'Viễn Tưởng' },
  { id: 'vo-thuat',   name: 'Võ Thuật' },
  { id: 'gia-dinh',   name: 'Gia Đình' },
  { id: 'the-thao',   name: 'Thể Thao' },
  { id: 'am-nhac',    name: 'Âm Nhạc' },
  { id: 'au-my',      name: '🌎 Âu Mỹ' },
  { id: 'han-quoc',   name: '🇰🇷 Hàn Quốc' },
  { id: 'trung-quoc', name: '🇨🇳 Trung Quốc' },
  { id: 'nhat-ban',   name: '🇯🇵 Nhật Bản' },
  { id: 'thai-lan',   name: '🇹🇭 Thái Lan' },
  { id: 'viet-nam',   name: '🇻🇳 Việt Nam' },
];

const EP_COLS        = 7;
const HOME_GRID_COLS = 6;
const SEARCH_COLS    = 7;

// ── Key codes ─────────────────────────────────────────────────────────────────
const KEY = {
  UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, ENTER: 13,
  BACK: 10009, ESC: 27, BACKSPACE: 8,
  PLAY: 415, PAUSE: 19, PLAYPAUSE: 10252,
  STOP: 413, FF: 417, REW: 412,
};

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  screen:     'home',
  prevScreen: 'home',

  homeZone:     'sidebar',
  sidebarFocus: 2,          // start on Phim Mới
  grid: {
    catId: null, catName: '',
    items: [], page: 1, hasMore: false, loading: false, focus: 0,
  },

  detail:    null,
  serverIdx: 0,
  focusZone: 'eps',   // 'servers' | 'eps'
  focusEp:   0,
  focusSrv:  0,

  search: { query: '', items: [], loading: false, focus: -1, _debounce: null },

  overlayTimer:    null,
  currentSlug:     null,
  currentEpIdx:    0,
  hls:             null,
};

// ── Viewport scaling ──────────────────────────────────────────────────────────
function scaleToViewport() {
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  document.body.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  scaleToViewport();
  window.addEventListener('resize', scaleToViewport);
  registerTizenKeys();
  document.addEventListener('keydown', onKey);
  document.getElementById('search-input').addEventListener('input', e => {
    const q = e.target.value.trim();
    state.search.query = q;
    clearTimeout(state.search._debounce);
    if (!q) { state.search.items = []; renderSearch(); return; }
    state.search._debounce = setTimeout(() => doSearch(q), 500);
  });
  startApp();
});

async function startApp() {
  showScreen('loading');
  document.querySelector('.loading-version').textContent = 'v' + VERSION;
  document.getElementById('sidebar-version').textContent = 'v' + VERSION;
  showHome();
}

function registerTizenKeys() {
  try {
    ['MediaPlayPause','MediaPlay','MediaPause','MediaStop','MediaFastForward','MediaRewind']
      .forEach(k => tizen.tvinputdevice.registerKey(k));
  } catch (_) {}
}

// ── API fetch ─────────────────────────────────────────────────────────────────
async function fetchCatalog(id, page = 1) {
  const path = CATALOG_PATHS[id];
  if (!path) return [];
  const sep = path.includes('?') ? '&' : '?';
  const r = await fetch(`${API}${path}${sep}page=${page}`);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const d = await r.json();
  return d.data?.items || d.items || [];
}

async function fetchDetail(slug) {
  const r = await fetch(`${API}/phim/${slug}`);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function fetchSearch(query) {
  const r = await fetch(`${API}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}&limit=24`);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const d = await r.json();
  return d.data?.items || [];
}

function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return CDN + '/' + path.replace(/^\//, '');
}

// ── Screen switcher ───────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  state.screen = name;
}

// ── Key handler ───────────────────────────────────────────────────────────────
function onKey(e) {
  const k = e.keyCode;
  if (state.screen === 'home')   { if (handleHome(k))   e.preventDefault(); return; }
  if (state.screen === 'search') { if (handleSearch(k)) e.preventDefault(); return; }
  if (state.screen === 'detail') { if (handleDetail(k)) e.preventDefault(); return; }
  if (state.screen === 'player') { if (handlePlayer(k)) e.preventDefault(); return; }
}

// ── Home ──────────────────────────────────────────────────────────────────────
let _sidebarDebounce = null;

function showHome() {
  showScreen('home');
  if (!state.grid.catId) loadHomeGrid(CATALOGS[state.sidebarFocus]);
  else renderHome();
}

function renderHome() {
  const home = document.getElementById('screen-home');
  if (home) home.classList.toggle('sidebar-collapsed', state.homeZone === 'grid');
  renderSidebar();
  renderHomeGrid();
}

function renderSidebar() {
  const list = document.getElementById('sidebar-list');
  list.innerHTML = CATALOGS.map((cat, i) => {
    const focused = state.homeZone === 'sidebar' && i === state.sidebarFocus;
    const active  = cat.id === state.grid.catId;
    return `<li class="sidebar-item${focused ? ' focused' : ''}${active ? ' active' : ''}">${escHtml(cat.name)}</li>`;
  }).join('');
  const fi = list.querySelector('.sidebar-item.focused');
  if (fi) fi.scrollIntoView({ block: 'nearest' });
}

function renderHomeGrid() {
  const { catName, items, loading, page, hasMore } = state.grid;
  const maxFocus   = items.length + (hasMore ? 1 : 0) - 1;
  if (maxFocus >= 0 && state.grid.focus > maxFocus) state.grid.focus = maxFocus;
  const focus      = Math.max(0, state.grid.focus);

  document.getElementById('home-cat-name').textContent  = catName || '';
  document.getElementById('home-page-info').textContent = hasMore || page > 1 ? `Trang ${page}` : '';

  const el             = document.getElementById('home-grid');
  const loadingOverlay = document.getElementById('home-loading');

  if (!state.grid.catId && !loading) {
    loadingOverlay?.classList.add('hidden');
    el.innerHTML = '<div class="grid-hint">← Chọn thể loại</div>';
    return;
  }
  if (loading && !items.length) {
    loadingOverlay?.classList.remove('hidden');
    el.innerHTML = '';
    return;
  }
  loadingOverlay?.classList.add('hidden');

  const inGrid    = state.homeZone === 'grid';
  const cardsHtml = items.map((m, i) =>
    `<div class="card ${inGrid && i === focus ? 'focused' : ''}">
      <div class="card-poster" style="background-image:url('${escHtml(imgUrl(m.thumb_url || m.poster_url))}')"></div>
      <div class="card-title">${escHtml(m.name)}</div>
    </div>`
  ).join('');

  const loadMoreIdx  = items.length;
  const loadMoreHtml = hasMore
    ? `<div class="card card-load-more ${inGrid && loadMoreIdx === focus ? 'focused' : ''}">
        <div class="card-load-more-icon">+</div>
        <div class="card-title">Tải thêm</div>
      </div>`
    : '';

  el.innerHTML = cardsHtml + loadMoreHtml +
    (loading ? '<div class="grid-loading"><div class="spinner" style="width:48px;height:48px;border-width:5px"></div></div>' : '');

  requestAnimationFrame(() => {
    const fc = el.querySelector('.card.focused');
    if (fc) fc.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });
}

async function loadHomeGrid(cat) {
  if (cat.id === 'search') return;
  state.grid = { catId: cat.id, catName: cat.name, items: [], page: 1, hasMore: false, loading: true, focus: 0 };
  renderHome();
  try {
    const items = cat.local ? buildContinueWatching() : await fetchCatalog(cat.id, 1);
    state.grid.items   = items;
    state.grid.hasMore = !cat.local && items.length >= 10;
  } catch (_) {}
  state.grid.loading = false;
  renderHome();
}

async function loadMoreHomeGrid() {
  if (state.grid.loading || !state.grid.hasMore) return;
  state.grid.loading = true;
  state.grid.page++;
  renderHomeGrid();
  try {
    const more = await fetchCatalog(state.grid.catId, state.grid.page);
    state.grid.items   = [...state.grid.items, ...more];
    state.grid.hasMore = more.length >= 10;
  } catch (_) {}
  state.grid.loading = false;
  renderHome();
}

function handleHome(k) {
  return state.homeZone === 'sidebar' ? handleSidebarKey(k) : handleGridKey(k);
}

function handleSidebarKey(k) {
  const n = CATALOGS.length;
  if (k === KEY.UP) {
    state.sidebarFocus = state.sidebarFocus === 0 ? n - 1 : state.sidebarFocus - 1;
    _scheduleSidebarLoad();
    renderSidebar();
  } else if (k === KEY.DOWN) {
    state.sidebarFocus = state.sidebarFocus >= n - 1 ? 0 : state.sidebarFocus + 1;
    _scheduleSidebarLoad();
    renderSidebar();
  } else if (k === KEY.ENTER || k === KEY.RIGHT) {
    clearTimeout(_sidebarDebounce);
    const cat = CATALOGS[state.sidebarFocus];
    if (cat.id === 'search') { showSearch(); return true; }
    const needsLoad = cat.id !== state.grid.catId;
    if (needsLoad) loadHomeGrid(cat);
    state.homeZone = 'grid';
    state.grid.focus = 0;
    if (!needsLoad) renderHome();
    return true;
  } else { return false; }
  return true;
}

function _scheduleSidebarLoad() {
  clearTimeout(_sidebarDebounce);
  const cat = CATALOGS[state.sidebarFocus];
  if (!cat || cat.id === 'search') return;
  _sidebarDebounce = setTimeout(() => {
    if (cat.id !== state.grid.catId) loadHomeGrid(cat);
  }, 350);
}

function getGridCols(gridId) {
  const cards = document.querySelectorAll(`#${gridId} .card`);
  if (!cards.length) return HOME_GRID_COLS;
  const firstTop = cards[0].offsetTop;
  let cols = 0;
  for (const card of cards) {
    if (card.offsetTop !== firstTop) break;
    cols++;
  }
  return cols || HOME_GRID_COLS;
}

function handleGridKey(k) {
  const { items, focus, hasMore, loading } = state.grid;
  const totalCount = items.length + (hasMore ? 1 : 0);
  const max        = totalCount - 1;
  const cols       = getGridCols('home-grid');
  const col        = focus % cols;
  const row        = Math.floor(focus / cols);
  const totalRows  = Math.ceil(totalCount / cols);

  if (max < 0 && k !== KEY.LEFT && k !== KEY.BACK && k !== KEY.ESC && k !== KEY.BACKSPACE) return false;

  if (k === KEY.LEFT) {
    if (col === 0) { state.homeZone = 'sidebar'; renderHome(); return true; }
    state.grid.focus--;
  } else if (k === KEY.RIGHT) {
    if (focus < max) state.grid.focus++;
    else if (!loading) state.grid.focus = 0;
  } else if (k === KEY.UP) {
    if (row === 0) state.grid.focus = Math.min(max, (totalRows - 1) * cols + col);
    else state.grid.focus = Math.max(0, focus - cols);
  } else if (k === KEY.DOWN) {
    const next = focus + cols;
    if (next <= max) state.grid.focus = next;
    else if (!loading) state.grid.focus = col <= max ? col : 0;
  } else if (k === KEY.ENTER) {
    if (hasMore && focus === items.length) { loadMoreHomeGrid(); return true; }
    const item = items[focus];
    if (item) { state.prevScreen = 'home'; showDetail(item.slug); }
    return true;
  } else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    state.homeZone = 'sidebar';
  } else { return false; }

  renderHome();
  return true;
}

// ── Search ────────────────────────────────────────────────────────────────────
function showSearch(reset = true) {
  if (reset) {
    state.search.query = '';
    state.search.items = [];
    state.search.loading = false;
    state.search.focus = -1;
    clearTimeout(state.search._debounce);
    const inp = document.getElementById('search-input');
    if (inp) inp.value = '';
  }
  state.prevScreen = state.screen;
  showScreen('search');
  renderSearch();
  setTimeout(() => document.getElementById('search-input')?.focus(), 80);
}

async function doSearch(query) {
  if (!query || state.search.query !== query) return;
  state.search.loading = true;
  state.search.items   = [];
  state.search.focus   = -1;
  renderSearch();
  try {
    const items = await fetchSearch(query);
    if (state.search.query !== query) return;
    state.search.items = items;
  } catch (_) {}
  state.search.loading = false;
  renderSearch();
}

function renderSearch() {
  const { items, loading, focus, query } = state.search;
  const el = document.getElementById('search-results');
  if (!el) return;
  document.getElementById('search-input-wrap')?.classList.toggle('focused', focus === -1);

  if (loading && !items.length) {
    el.classList.add('is-spinner');
    el.innerHTML = '<div class="spinner"></div>';
  } else if (!items.length) {
    el.classList.remove('is-spinner');
    el.innerHTML = `<div class="grid-hint">${query ? 'Không tìm thấy kết quả' : 'Nhập tên phim để tìm kiếm'}</div>`;
  } else {
    el.classList.remove('is-spinner');
    el.innerHTML = items.map((m, i) =>
      `<div class="card ${i === focus ? 'focused' : ''}">
        <div class="card-poster" style="background-image:url('${escHtml(imgUrl(m.thumb_url || m.poster_url))}')"></div>
        <div class="card-title">${escHtml(m.name)}</div>
      </div>`
    ).join('');
    requestAnimationFrame(() => {
      el.querySelector('.card.focused')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }
}

function handleSearch(k) {
  const { items, focus } = state.search;

  if (focus === -1) {
    if (k === KEY.DOWN && items.length) {
      state.search.focus = 0;
      document.getElementById('search-input').blur();
      renderSearch();
      return true;
    }
    if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) { showHome(); return true; }
    return false;
  }

  const max  = items.length - 1;
  const col  = focus % SEARCH_COLS;
  const row  = Math.floor(focus / SEARCH_COLS);

  if (k === KEY.UP) {
    if (row === 0) { state.search.focus = -1; document.getElementById('search-input').focus(); renderSearch(); return true; }
    state.search.focus = Math.max(0, focus - SEARCH_COLS);
  } else if (k === KEY.DOWN) {
    state.search.focus = Math.min(max, focus + SEARCH_COLS);
  } else if (k === KEY.LEFT) {
    if (col === 0) return false;
    state.search.focus--;
  } else if (k === KEY.RIGHT) {
    if (focus >= max) return false;
    state.search.focus++;
  } else if (k === KEY.ENTER) {
    const item = items[focus];
    if (item) { state.prevScreen = 'search'; showDetail(item.slug); }
    return true;
  } else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    state.search.focus = -1;
    document.getElementById('search-input').focus();
    renderSearch();
    return true;
  } else { return false; }

  renderSearch();
  return true;
}

// ── Detail ────────────────────────────────────────────────────────────────────
async function showDetail(slug) {
  showScreen('detail');
  document.getElementById('detail-content').innerHTML = '<div class="loading-msg"><div class="spinner"></div></div>';

  try {
    const data     = await fetchDetail(slug);
    state.detail   = data;
    state.currentSlug = slug;
    state.serverIdx = 0;
    state.focusZone = 'eps';
    state.focusEp   = 0;
    state.focusSrv  = 0;

    const history = getHistory();
    if (history[slug]) {
      state.currentEpIdx = history[slug].epIdx || 0;
      state.focusEp      = state.currentEpIdx;
    } else {
      state.currentEpIdx = -1;
    }

    renderDetail();
  } catch (e) {
    document.getElementById('detail-content').innerHTML =
      `<div class="error-msg">Không tải được nội dung.<br>${escHtml(e.message)}</div>`;
  }
}

function currentEps() {
  return state.detail?.episodes?.[state.serverIdx]?.server_data || [];
}

function renderDetail() {
  const data    = state.detail;
  const m       = data.movie;
  const servers = data.episodes || [];
  const eps     = currentEps();
  const slug    = state.currentSlug;
  const history = getHistory();
  const lastEp  = history[slug];

  const poster = imgUrl(m.poster_url || m.thumb_url);

  const tags = [
    m.quality ? `<span class="tag quality">${escHtml(m.quality)}</span>` : '',
    m.lang    ? `<span class="tag">${escHtml(m.lang)}</span>` : '',
    m.year    ? `<span class="tag">${escHtml(String(m.year))}</span>` : '',
    m.time    ? `<span class="tag">${escHtml(m.time)}</span>` : '',
    ...(m.category || []).slice(0, 3).map(c => `<span class="tag">${escHtml(c.name)}</span>`),
  ].filter(Boolean).join('');

  const serverTabsHtml = servers.map((s, i) =>
    `<div class="server-tab ${i === state.serverIdx ? 'active' : ''} ${state.focusZone === 'servers' && i === state.focusSrv ? 'focused' : ''}">${escHtml(s.server_name)}</div>`
  ).join('');

  const isMovie = eps.length === 1 && eps[0]?.name === 'Full';
  const epGrid  = eps.map((ep, i) => {
    const isCurrent = i === state.currentEpIdx;
    const isFocused = state.focusZone === 'eps' && i === state.focusEp;
    return `<div class="ep-card ${isCurrent ? 'current-ep' : ''} ${isFocused ? 'focused' : ''}">${escHtml(isMovie ? '▶ Xem ngay' : ep.name)}</div>`;
  }).join('');

  document.getElementById('detail-content').innerHTML = `
    <div class="series-back">← Quay lại  •  <span>${escHtml(m.name)}</span></div>
    <div class="series-layout">
      <div class="series-poster" style="background-image:url('${escHtml(poster)}')"></div>
      <div class="series-meta">
        <div class="series-title">${escHtml(m.name)}</div>
        ${m.origin_name ? `<div class="series-origin">${escHtml(m.origin_name)}</div>` : ''}
        <div class="series-tags">${tags}</div>
        <div class="series-desc">${escHtml((m.content || '').replace(/<[^>]+>/g, ''))}</div>
        ${lastEp ? `<div class="series-resume">▶ Tiếp tục: ${escHtml(eps[lastEp.epIdx]?.name || '')}</div>` : ''}
        ${servers.length > 1 ? `<div class="server-tabs">${serverTabsHtml}</div>` : ''}
        <div class="ep-section-title">Danh sách tập (${eps.length})</div>
        <div class="episodes-grid" id="episodes-grid">${epGrid}</div>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    document.querySelector('.ep-card.focused')?.scrollIntoView({ block: 'nearest' });
  });
}

function handleDetail(k) {
  const servers = state.detail?.episodes || [];
  const eps     = currentEps();

  if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    if (state.prevScreen === 'search') showSearch(false);
    else showHome();
    return true;
  }

  // Switch between server tabs and episode grid
  if (state.focusZone === 'servers') {
    const maxSrv = servers.length - 1;
    if (k === KEY.LEFT)  state.focusSrv = Math.max(0, state.focusSrv - 1);
    else if (k === KEY.RIGHT) state.focusSrv = Math.min(maxSrv, state.focusSrv + 1);
    else if (k === KEY.DOWN) { state.focusZone = 'eps'; state.focusEp = 0; }
    else if (k === KEY.ENTER) {
      state.serverIdx = state.focusSrv;
      state.focusZone = 'eps';
      state.focusEp   = 0;
    } else { return false; }
    renderDetail();
    return true;
  }

  // Episode grid zone
  const max    = eps.length - 1;
  const epCols = getGridCols('episodes-grid') || EP_COLS;
  const col    = state.focusEp % epCols;

  if (k === KEY.UP) {
    if (Math.floor(state.focusEp / epCols) === 0 && servers.length > 1) {
      state.focusZone = 'servers';
    } else {
      state.focusEp = Math.max(0, state.focusEp - epCols);
    }
  } else if (k === KEY.DOWN) {
    state.focusEp = Math.min(max, state.focusEp + epCols);
  } else if (k === KEY.LEFT) {
    if (col > 0) state.focusEp--;
    else return false;
  } else if (k === KEY.RIGHT) {
    if (state.focusEp < max) state.focusEp++;
    else return false;
  } else if (k === KEY.ENTER) {
    playEpisode(state.focusEp);
    return true;
  } else { return false; }

  renderDetail();
  return true;
}

// ── Player ────────────────────────────────────────────────────────────────────
function playEpisode(epIdx) {
  const eps = currentEps();
  if (!eps[epIdx]) return;
  const ep  = eps[epIdx];
  const url = ep.link_m3u8;
  if (!url) { return; }

  state.currentEpIdx = epIdx;
  state.focusEp      = epIdx;
  saveHistory(state.currentSlug, epIdx, state.detail?.movie?.name, state.detail?.movie?.thumb_url);

  showScreen('player');
  const m = state.detail?.movie;
  const isMovie = eps.length === 1;
  document.getElementById('player-title').textContent =
    (m?.name || '') + (isMovie ? '' : ' — ' + ep.name);
  document.getElementById('seek-fill').style.width  = '0%';
  document.getElementById('player-time').textContent = '0:00 / 0:00';
  showOverlayPersistent();

  startPlayback(url);
}

function startPlayback(url) {
  const video = document.getElementById('video');
  if (!video) return;

  if (state.hls) { state.hls.destroy(); state.hls = null; }
  video.ontimeupdate = updatePlayerBar;
  video.onended      = playNext;

  if (typeof Hls !== 'undefined' && Hls.isSupported()) {
    const hls = new Hls({ enableWorker: false, startFragPrefetch: true });
    state.hls = hls;
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {});
      showOverlay();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.play().catch(() => {});
    showOverlay();
  }
}

function stopPlayback() {
  const video = document.getElementById('video');
  if (video) { video.src = ''; video.ontimeupdate = null; video.onended = null; }
  if (state.hls) { state.hls.destroy(); state.hls = null; }
  clearTimeout(state.overlayTimer);
}

function playNext() {
  const eps = currentEps();
  const next = state.currentEpIdx + 1;
  if (next < eps.length) playEpisode(next);
}

function updatePlayerBar() {
  const video = document.getElementById('video');
  if (!video || !video.duration) return;
  const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  document.getElementById('player-time').textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
  document.getElementById('seek-fill').style.width   = `${(video.currentTime / video.duration) * 100}%`;
}

function showOverlay() {
  const overlay = document.getElementById('player-overlay');
  if (!overlay) return;
  overlay.classList.add('visible');
  clearTimeout(state.overlayTimer);
  state.overlayTimer = setTimeout(() => overlay.classList.remove('visible'), 3500);
}

function showOverlayPersistent() {
  clearTimeout(state.overlayTimer);
  document.getElementById('player-overlay')?.classList.add('visible');
}

function handlePlayer(k) {
  const video = document.getElementById('video');

  if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE || k === KEY.STOP) {
    stopPlayback();
    showScreen('detail');
    renderDetail();
    return true;
  }

  showOverlay();

  if (k === KEY.ENTER || k === KEY.PLAY || k === KEY.PAUSE || k === KEY.PLAYPAUSE) {
    if (video) video.paused ? video.play().catch(() => {}) : video.pause();
  } else if (k === KEY.RIGHT || k === KEY.FF) {
    if (video) video.currentTime += 10;
  } else if (k === KEY.LEFT || k === KEY.REW) {
    if (video) video.currentTime = Math.max(0, video.currentTime - 10);
  } else { return false; }

  return true;
}

// ── Watch history ─────────────────────────────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem('tizenphim_watchHistory') || '{}'); } catch { return {}; }
}

function saveHistory(slug, epIdx, name, poster) {
  try {
    const h  = getHistory();
    h[slug]  = { ...h[slug], epIdx, name, poster, ts: Date.now() };
    localStorage.setItem('tizenphim_watchHistory', JSON.stringify(h));
  } catch (_) {}
}

function buildContinueWatching() {
  const h = getHistory();
  return Object.entries(h)
    .filter(([, v]) => v.name)
    .sort((a, b) => b[1].ts - a[1].ts)
    .slice(0, 20)
    .map(([slug, v]) => ({
      slug, name: v.name,
      thumb_url: v.poster || '',
      poster_url: v.poster || '',
    }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
