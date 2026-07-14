'use strict';

// Dev: ?sim=tizen forces Tizen code path in desktop browser
if (new URLSearchParams(location.search).get('sim') === 'tizen') window.tizen = window.tizen || {};

// Global error overlay — shows any uncaught error/rejection instead of silent black
function _showError(msg, extra) {
  try {
    document.body.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;transform:none;overflow:auto;background:#111;color:#fff;font-family:Arial,sans-serif;font-size:32px;box-sizing:border-box;padding:80px;z-index:2147483647';
    document.body.innerHTML =
      '<div style="color:#e50914;font-size:48px;font-weight:700;margin-bottom:40px">TizenPhim Error</div>' +
      '<div style="word-break:break-all;margin-bottom:24px">' + String(msg).replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</div>' +
      '<div style="color:#888;font-size:26px">' + String(extra || '').replace(/</g,'&lt;') + ' | v' + (typeof VERSION !== 'undefined' ? VERSION : '?') + '</div>';
  } catch(_) {}
}
window.addEventListener('error', function(ev) {
  _showError((ev.error ? ev.error.message : ev.message) || String(ev.message), 'line ' + (ev.lineno || '?'));
});
window.addEventListener('unhandledrejection', function(ev) {
  var r = ev.reason;
  _showError(r && r.message ? r.message : String(r), 'unhandledrejection');
});

// ── Config ────────────────────────────────────────────────────────────────────
const VERSION = '1.0.0';
const API     = 'https://phimapi.com';
const CDN     = 'https://phimimg.com';

// ── Catalogs ──────────────────────────────────────────────────────────────────
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
  { id: 'favorite',   name: 'Yêu Thích',    local: true },
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
  { id: 'au-my',      name: 'Âu Mỹ' },
  { id: 'han-quoc',   name: 'Hàn Quốc' },
  { id: 'trung-quoc', name: 'Trung Quốc' },
  { id: 'nhat-ban',   name: 'Nhật Bản' },
  { id: 'thai-lan',   name: 'Thái Lan' },
  { id: 'viet-nam',   name: 'Việt Nam' },
];

const LOCAL_BUILDERS = { continue: buildContinueWatching, favorite: buildFavorites };

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

const LONG_PRESS_MS  = 700;
const REMOVABLE_CATS = { continue: true, favorite: true };

let _pressTimer = null;
let _pressFired = false;
let _pressTarget = null;
let _enterHeld = false;

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  screen:     'home',
  prevScreen: 'home',

  homeZone:     'sidebar',
  sidebarFocus: 3,
  grid: {
    catId: null, catName: '',
    items: [], page: 1, hasMore: false, loading: false, focus: 0,
  },

  detail:    null,
  serverIdx: 0,
  focusZone: 'eps',
  focusEp:   0,
  focusSrv:  0,

  search: { query: '', items: [], loading: false, focus: -1, _debounce: null },

  overlayTimer:    null,
  currentSlug:     null,
  currentEpIdx:    0,

  confirmDialog:   null,
};

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  try {
    registerTizenKeys();
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', resetEnterPress);
    const inp = document.getElementById('search-input');
    if (inp) inp.addEventListener('input', function(e) {
      const q = e.target.value.trim();
      state.search.query = q;
      clearTimeout(state.search._debounce);
      if (!q) { state.search.items = []; renderSearch(); return; }
      state.search._debounce = setTimeout(function() { doSearch(q); }, 500);
    });
    startApp().catch(function(e) { _showError(e && e.message ? e.message : String(e), 'startApp'); });
  } catch(e) {
    _showError(e && e.message ? e.message : String(e), 'DOMContentLoaded');
  }
});

async function startApp() {
  showScreen('loading');
  const vEl = document.querySelector('.loading-version');
  if (vEl) vEl.textContent = 'v' + VERSION;
  const sidebarVer = document.getElementById('sidebar-version');
  if (sidebarVer) sidebarVer.textContent = 'v' + VERSION;
  showHome();
}

function registerTizenKeys() {
  try {
    ['MediaPlayPause','MediaPlay','MediaPause','MediaStop','MediaFastForward','MediaRewind']
      .forEach(function(k) { tizen.tvinputdevice.registerKey(k); });
  } catch (_) {}
}

// ── API fetch ─────────────────────────────────────────────────────────────────
async function fetchCatalog(id, page) {
  if (page === undefined) page = 1;
  const path = CATALOG_PATHS[id];
  if (!path) return [];
  const sep = path.indexOf('?') >= 0 ? '&' : '?';
  const r = await fetch(API + path + sep + 'page=' + page);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const d = await r.json();
  return (d.data && d.data.items) || d.items || [];
}

async function fetchDetail(slug) {
  const r = await fetch(API + '/phim/' + slug);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function fetchSearch(query) {
  const r = await fetch(API + '/v1/api/tim-kiem?keyword=' + encodeURIComponent(query) + '&limit=24');
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const d = await r.json();
  return (d.data && d.data.items) || [];
}

function imgUrl(path) {
  if (!path) return '';
  if (path.indexOf('http') === 0) return path;
  return CDN + '/' + path.replace(/^\//, '');
}

// ── Screen switcher ───────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('screen-' + name).classList.add('active');
  state.screen = name;
}

// ── Key handler ───────────────────────────────────────────────────────────────
function startEnterPress() {
  if (_pressTimer || state.confirmDialog) return;
  const item = state.grid.items[state.grid.focus];
  if (!item) return;
  _pressFired = false;
  _enterHeld  = true;
  _pressTarget = { catId: state.grid.catId, slug: item.slug, name: item.name };
  _pressTimer = setTimeout(function() {
    _pressTimer = null;
    _pressFired = true;
    openConfirmDialog(_pressTarget);
  }, LONG_PRESS_MS);
}

function onKeyUp(e) {
  if (e.keyCode !== KEY.ENTER) return;
  _enterHeld = false;
  if (_pressTimer) {
    clearTimeout(_pressTimer);
    _pressTimer = null;
    if (!_pressFired && _pressTarget) {
      state.prevScreen = 'home';
      showDetail(_pressTarget.slug);
    }
  }
  _pressFired = false;
  _pressTarget = null;
}

function resetEnterPress() {
  if (_pressTimer) { clearTimeout(_pressTimer); _pressTimer = null; }
  _pressFired = false;
  _pressTarget = null;
  _enterHeld = false;
}

function openConfirmDialog(target) {
  state.confirmDialog = { catId: target.catId, slug: target.slug, name: target.name, focus: 1 };
  renderConfirmDialog();
}

function closeConfirmDialog() {
  state.confirmDialog = null;
  renderConfirmDialog();
}

function renderConfirmDialog() {
  const overlay = document.getElementById('confirm-overlay');
  if (!overlay) return;
  const d = state.confirmDialog;
  if (!d) { overlay.classList.add('hidden'); overlay.innerHTML = ''; return; }
  overlay.innerHTML =
    '<div class="confirm-box">' +
      '<div class="confirm-msg">Xóa "' + escHtml(d.name) + '" khỏi danh sách?</div>' +
      '<div class="confirm-actions">' +
        '<div class="confirm-btn' + (d.focus === 0 ? ' focused' : '') + '">Xóa</div>' +
        '<div class="confirm-btn' + (d.focus === 1 ? ' focused' : '') + '">Hủy</div>' +
      '</div>' +
    '</div>';
  overlay.classList.remove('hidden');
}

function handleConfirmDialog(k) {
  const d = state.confirmDialog;
  if (!d) return false;
  if (k === KEY.ENTER && _enterHeld) return true;              // ignore the held-ENTER that opened the dialog
  if (k === KEY.LEFT || k === KEY.RIGHT) { d.focus = d.focus === 0 ? 1 : 0; renderConfirmDialog(); return true; }
  if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) { closeConfirmDialog(); return true; }
  if (k === KEY.ENTER) {
    if (d.focus === 0) removeFromLocalList(d.catId, d.slug);
    closeConfirmDialog();
    return true;
  }
  return true;
}

function removeFromLocalList(catId, slug) {
  try {
    const key   = catId === 'favorite' ? 'tizenphim_favorites' : 'tizenphim_watchHistory';
    const store = JSON.parse(localStorage.getItem(key) || '{}');
    delete store[slug];
    localStorage.setItem(key, JSON.stringify(store));
  } catch (_) {}
  if (state.grid.catId === catId && LOCAL_BUILDERS[catId]) {
    state.grid.items = LOCAL_BUILDERS[catId]();
    if (state.grid.focus > state.grid.items.length - 1) state.grid.focus = Math.max(0, state.grid.items.length - 1);
    renderHome();
  }
}

function onKey(e) {
  const k = e.keyCode;
  if (state.confirmDialog) { if (handleConfirmDialog(k)) e.preventDefault(); return; }
  if (k === KEY.ENTER && state.screen === 'home' && state.homeZone === 'grid' &&
      REMOVABLE_CATS[state.grid.catId] && state.grid.items[state.grid.focus]) {
    e.preventDefault();
    startEnterPress();
    return;
  }
  if (state.screen === 'home')   { if (handleHome(k))   e.preventDefault(); return; }
  if (state.screen === 'search') { if (handleSearch(k)) e.preventDefault(); return; }
  if (state.screen === 'detail') { if (handleDetail(k)) e.preventDefault(); return; }
  if (state.screen === 'player') { if (handlePlayer(k)) e.preventDefault(); return; }
}

// ── Home ──────────────────────────────────────────────────────────────────────
let _sidebarDebounce = null;
let _lastProgressSave = 0;
let _hls = null;

function showHome() {
  showScreen('home');
  if (!state.grid.catId) { loadHomeGrid(CATALOGS[state.sidebarFocus]); return; }
  if (LOCAL_BUILDERS[state.grid.catId]) {
    const keep = state.grid.focus;
    state.grid.items = LOCAL_BUILDERS[state.grid.catId]();
    state.grid.focus = Math.min(keep, Math.max(0, state.grid.items.length - 1));
  }
  renderHome();
}

function renderHome() {
  const home = document.getElementById('screen-home');
  if (home) home.classList.toggle('sidebar-collapsed', state.homeZone === 'grid');
  renderSidebar();
  renderHomeGrid();
}

function renderSidebar() {
  const list = document.getElementById('sidebar-list');
  list.innerHTML = CATALOGS.map(function(cat, i) {
    const focused = state.homeZone === 'sidebar' && i === state.sidebarFocus;
    const active  = cat.id === state.grid.catId;
    return '<li class="sidebar-item' + (focused ? ' focused' : '') + (active ? ' active' : '') + '">' + escHtml(cat.name) + '</li>';
  }).join('');
  const fi = list.querySelector('.sidebar-item.focused');
  if (fi) fi.scrollIntoView({ block: 'nearest' });
}

// Auto-scroll (marquee) a focused card's title when it's too long to fit.
// The grid rebuilds innerHTML on every focus move, so the animation is
// discarded automatically once the card loses focus.
function marqueeTitle(card) {
  if (!card) return;
  const title = card.querySelector('.card-title');
  if (!title || !title.animate) return;
  if (title.scrollWidth - title.clientWidth <= 2) return;
  const text = title.innerHTML;
  title.innerHTML =
    '<span class="card-title-scroll">' +
      '<span class="cts-piece">' + text + '</span>' +
      '<span class="cts-piece" aria-hidden="true">' + text + '</span>' +
    '</span>';
  const scroll = title.firstChild;
  const pieces = scroll.querySelectorAll('.cts-piece');
  const shift  = pieces[1].offsetLeft - pieces[0].offsetLeft;
  if (shift <= 2) return;
  const dur = Math.max(6000, shift * 55);
  scroll.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(' + (-shift) + 'px)' },
  ], { duration: dur, iterations: Infinity, easing: 'linear' });
}

function updateGridFocus(containerEl, oldIndex, newIndex, marquee) {
  const cards = containerEl.children;
  if (cards[oldIndex]) cards[oldIndex].classList.remove('focused');
  const nc = cards[newIndex];
  if (nc) {
    nc.classList.add('focused');
    requestAnimationFrame(function() {
      nc.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      if (marquee) marqueeTitle(nc);
    });
  }
}

function renderHomeGrid() {
  const { catName, items, loading, page, hasMore } = state.grid;
  const maxFocus   = items.length + (hasMore ? 1 : 0) - 1;
  if (maxFocus >= 0 && state.grid.focus > maxFocus) state.grid.focus = maxFocus;
  const focus      = Math.max(0, state.grid.focus);

  document.getElementById('home-cat-name').textContent  = catName || '';

  const el             = document.getElementById('home-grid');
  const loadingOverlay = document.getElementById('home-loading');

  if (!state.grid.catId && !loading) {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
    el.innerHTML = '<div class="grid-hint">← Chọn thể loại</div>';
    return;
  }
  if (loading && !items.length) {
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');
    el.innerHTML = '';
    return;
  }
  if (loadingOverlay) loadingOverlay.classList.add('hidden');

  const inGrid    = state.homeZone === 'grid';
  const cardsHtml = items.map(function(m, i) {
    return '<div class="card ' + (inGrid && i === focus ? 'focused' : '') + '">' +
      '<div class="card-poster" style="background-image:url(\'' + escHtml(imgUrl(m.thumb_url || m.poster_url)) + '\')">' +
        (m._progress != null ? '<div class="card-progress"><div class="card-progress-fill" style="width:' + Math.round(m._progress * 100) + '%"></div></div>' : '') +
      '</div>' +
      '<div class="card-title">' + escHtml(m.name) + '</div>' +
      '</div>';
  }).join('');

  const loadMoreIdx  = items.length;
  const loadMoreHtml = hasMore
    ? '<div class="card card-load-more ' + (inGrid && loadMoreIdx === focus ? 'focused' : '') + '">' +
        '<div class="card-load-more-icon">+</div>' +
        '<div class="card-title">Tải thêm</div>' +
      '</div>'
    : '';

  el.innerHTML = cardsHtml + loadMoreHtml +
    (loading ? '<div class="grid-loading"><div class="spinner" style="width:48px;height:48px;border-width:5px"></div></div>' : '');

  requestAnimationFrame(function() {
    const fc = el.querySelector('.card.focused');
    if (fc) { fc.scrollIntoView({ block: 'nearest', inline: 'nearest' }); marqueeTitle(fc); }
  });
}

async function loadHomeGrid(cat) {
  if (cat.id === 'search') return;
  state.grid = { catId: cat.id, catName: cat.name, items: [], page: 1, hasMore: false, loading: true, focus: 0 };
  renderHome();
  try {
    const items = LOCAL_BUILDERS[cat.id] ? LOCAL_BUILDERS[cat.id]() : await fetchCatalog(cat.id, 1);
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
  _sidebarDebounce = setTimeout(function() {
    if (cat.id !== state.grid.catId) loadHomeGrid(cat);
  }, 350);
}

function getGridCols(gridId) {
  const cards = document.querySelectorAll('#' + gridId + ' .card');
  if (!cards.length) return HOME_GRID_COLS;
  const firstTop = cards[0].offsetTop;
  let cols = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].offsetTop !== firstTop) break;
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

  let focusOnly = false;

  if (k === KEY.LEFT) {
    if (col === 0) { state.homeZone = 'sidebar'; renderHome(); return true; }
    state.grid.focus--;
    focusOnly = true;
  } else if (k === KEY.RIGHT) {
    if (focus < max) state.grid.focus++;
    else if (!loading) state.grid.focus = 0;
    focusOnly = true;
  } else if (k === KEY.UP) {
    if (row === 0) state.grid.focus = Math.min(max, (totalRows - 1) * cols + col);
    else state.grid.focus = Math.max(0, focus - cols);
    focusOnly = true;
  } else if (k === KEY.DOWN) {
    const next = focus + cols;
    if (next <= max) state.grid.focus = next;
    else if (!loading) state.grid.focus = col <= max ? col : 0;
    focusOnly = true;
  } else if (k === KEY.ENTER) {
    if (hasMore && focus === items.length) { loadMoreHomeGrid(); return true; }
    const item = items[focus];
    if (item) { state.prevScreen = 'home'; showDetail(item.slug); }
    return true;
  } else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    state.homeZone = 'sidebar';
  } else { return false; }

  if (focusOnly) {
    updateGridFocus(document.getElementById('home-grid'), focus, state.grid.focus, true);
  } else {
    renderHome();
  }
  return true;
}

// ── Search ────────────────────────────────────────────────────────────────────
function showSearch(reset) {
  if (reset === undefined) reset = true;
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
  setTimeout(function() { const inp = document.getElementById('search-input'); if (inp) inp.focus(); }, 80);
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
  const sw = document.getElementById('search-input-wrap');
  if (sw) sw.classList.toggle('focused', focus === -1);

  if (loading && !items.length) {
    el.classList.add('is-spinner');
    el.innerHTML = '<div class="spinner"></div>';
  } else if (!items.length) {
    el.classList.remove('is-spinner');
    el.innerHTML = '<div class="grid-hint">' + (query ? 'Không tìm thấy kết quả' : 'Nhập tên phim để tìm kiếm') + '</div>';
  } else {
    el.classList.remove('is-spinner');
    el.innerHTML = items.map(function(m, i) {
      return '<div class="card ' + (i === focus ? 'focused' : '') + '">' +
        '<div class="card-poster" style="background-image:url(\'' + escHtml(imgUrl(m.thumb_url || m.poster_url)) + '\')"></div>' +
        '<div class="card-title">' + escHtml(m.name) + '</div>' +
        '</div>';
    }).join('');
    requestAnimationFrame(function() {
      const fc = el.querySelector('.card.focused');
      if (fc) { fc.scrollIntoView({ block: 'nearest', inline: 'nearest' }); marqueeTitle(fc); }
    });
  }
}

function handleSearch(k) {
  const { items, focus } = state.search;

  if (focus === -1) {
    if (k === KEY.DOWN && items.length) {
      state.search.focus = 0;
      const inp = document.getElementById('search-input');
      if (inp) inp.blur();
      renderSearch();
      return true;
    }
    if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) { showHome(); return true; }
    return false;
  }

  const max  = items.length - 1;
  const cols = getGridCols('search-results') || SEARCH_COLS;
  const col  = focus % cols;
  const row  = Math.floor(focus / cols);
  let focusOnly = false;

  if (k === KEY.UP) {
    if (row === 0) {
      state.search.focus = -1;
      const inp = document.getElementById('search-input');
      if (inp) inp.focus();
      renderSearch();
      return true;
    }
    state.search.focus = Math.max(0, focus - cols);
    focusOnly = true;
  } else if (k === KEY.DOWN) {
    state.search.focus = Math.min(max, focus + cols);
    focusOnly = true;
  } else if (k === KEY.LEFT) {
    if (col === 0) return false;
    state.search.focus--;
    focusOnly = true;
  } else if (k === KEY.RIGHT) {
    if (focus >= max) return false;
    state.search.focus++;
    focusOnly = true;
  } else if (k === KEY.ENTER) {
    const item = items[focus];
    if (item) { state.prevScreen = 'search'; showDetail(item.slug); }
    return true;
  } else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    state.search.focus = -1;
    const inp = document.getElementById('search-input');
    if (inp) inp.focus();
    renderSearch();
    return true;
  } else { return false; }

  if (focusOnly) {
    updateGridFocus(document.getElementById('search-results'), focus, state.search.focus, true);
  } else {
    renderSearch();
  }
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
      '<div class="error-msg">Không tải được nội dung.<br>' + escHtml(e.message) + '</div>';
  }
}

function currentEps() {
  if (!state.detail || !state.detail.episodes) return [];
  const srv = state.detail.episodes[state.serverIdx];
  return (srv && srv.server_data) || [];
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
    m.quality ? '<span class="tag quality">' + escHtml(m.quality) + '</span>' : '',
    m.lang    ? '<span class="tag">' + escHtml(m.lang) + '</span>' : '',
    m.year    ? '<span class="tag">' + escHtml(String(m.year)) + '</span>' : '',
    m.time    ? '<span class="tag">' + escHtml(m.time) + '</span>' : '',
  ].concat((m.category || []).slice(0, 3).map(function(c) {
    return '<span class="tag">' + escHtml(c.name) + '</span>';
  })).filter(Boolean).join('');

  const serverTabsHtml = servers.map(function(s, i) {
    return '<div class="server-tab' +
      (i === state.serverIdx ? ' active' : '') +
      (state.focusZone === 'servers' && i === state.focusSrv ? ' focused' : '') +
      '">' + escHtml(s.server_name) + '</div>';
  }).join('');

  const isMovie = eps.length === 1 && eps[0] && eps[0].name === 'Full';
  const epGrid  = eps.map(function(ep, i) {
    const isCurrent = i === state.currentEpIdx;
    const isFocused = state.focusZone === 'eps' && i === state.focusEp;
    return '<div class="ep-card' + (isCurrent ? ' current-ep' : '') + (isFocused ? ' focused' : '') + '">' +
      escHtml(isMovie ? '▶ Xem ngay' : ep.name) + '</div>';
  }).join('');

  const lastEpName = lastEp && eps[lastEp.epIdx] ? eps[lastEp.epIdx].name : '';

  document.getElementById('detail-content').innerHTML =
    '<div class="series-back">← Quay lại  •  <span>' + escHtml(m.name) + '</span></div>' +
    '<div class="series-layout">' +
      '<div class="series-poster" style="background-image:url(\'' + escHtml(poster) + '\')"></div>' +
      '<div class="series-meta">' +
        '<div class="series-title">' + escHtml(m.name) + '</div>' +
        (m.origin_name ? '<div class="series-origin">' + escHtml(m.origin_name) + '</div>' : '') +
        '<div class="series-tags">' + tags + '</div>' +
        '<div class="series-desc">' + escHtml((m.content || '').replace(/<[^>]+>/g, '')) + '</div>' +
        (lastEp && lastEpName ? '<div class="series-resume">▶ Tiếp tục: ' + escHtml(lastEpName) + '</div>' : '') +
        '<div class="fav-btn' + (state.focusZone === 'fav' ? ' focused' : '') + (isFavorite(slug) ? ' active' : '') + '">' +
          (isFavorite(slug) ? '♥ Đã Thích' : '♡ Yêu Thích') + '</div>' +
        (servers.length > 1 ? '<div class="server-tabs">' + serverTabsHtml + '</div>' : '') +
        '<div class="ep-section-title">Danh sách tập (' + eps.length + ')</div>' +
        '<div class="episodes-grid" id="episodes-grid">' + epGrid + '</div>' +
      '</div>' +
    '</div>';

  requestAnimationFrame(function() {
    const fc = document.querySelector('.ep-card.focused');
    if (fc) fc.scrollIntoView({ block: 'nearest' });
  });
}

function handleDetail(k) {
  const servers = (state.detail && state.detail.episodes) || [];
  const eps     = currentEps();

  if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    if (state.prevScreen === 'search') showSearch(false);
    else showHome();
    return true;
  }

  if (state.focusZone === 'fav') {
    if (k === KEY.DOWN) { state.focusZone = servers.length > 1 ? 'servers' : 'eps'; state.focusEp = 0; }
    else if (k === KEY.ENTER) {
      const m = state.detail && state.detail.movie;
      toggleFavorite(state.currentSlug, m && m.name, m && (m.thumb_url || m.poster_url));
    } else { return false; }
    renderDetail();
    return true;
  }

  if (state.focusZone === 'servers') {
    const maxSrv = servers.length - 1;
    if (k === KEY.LEFT)  state.focusSrv = Math.max(0, state.focusSrv - 1);
    else if (k === KEY.RIGHT) state.focusSrv = Math.min(maxSrv, state.focusSrv + 1);
    else if (k === KEY.UP) state.focusZone = 'fav';
    else if (k === KEY.DOWN) { state.focusZone = 'eps'; state.focusEp = 0; }
    else if (k === KEY.ENTER) {
      state.serverIdx = state.focusSrv;
      state.focusZone = 'eps';
      state.focusEp   = 0;
    } else { return false; }
    renderDetail();
    return true;
  }

  const max        = eps.length - 1;
  const epCols     = getGridCols('episodes-grid') || EP_COLS;
  const col        = state.focusEp % epCols;
  const oldFocusEp = state.focusEp;
  let focusOnly    = false;

  if (k === KEY.UP) {
    if (Math.floor(state.focusEp / epCols) === 0) {
      state.focusZone = servers.length > 1 ? 'servers' : 'fav';
    } else {
      state.focusEp = Math.max(0, state.focusEp - epCols);
      focusOnly = true;
    }
  } else if (k === KEY.DOWN) {
    state.focusEp = Math.min(max, state.focusEp + epCols);
    focusOnly = true;
  } else if (k === KEY.LEFT) {
    if (col > 0) { state.focusEp--; focusOnly = true; }
    else return false;
  } else if (k === KEY.RIGHT) {
    if (state.focusEp < max) { state.focusEp++; focusOnly = true; }
    else return false;
  } else if (k === KEY.ENTER) {
    playEpisode(state.focusEp);
    return true;
  } else { return false; }

  if (focusOnly) {
    updateGridFocus(document.getElementById('episodes-grid'), oldFocusEp, state.focusEp, false);
  } else {
    renderDetail();
  }
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

  const m = state.detail && state.detail.movie;
  const prev = getHistory()[state.currentSlug];
  const sameEp = prev && prev.epIdx === epIdx;
  const resumeTime = (sameEp && prev.time > 5 && (!prev.duration || prev.duration - prev.time > 10)) ? prev.time : 0;
  saveHistory(state.currentSlug, {
    epIdx: epIdx,
    name: m && m.name,
    poster: m && (m.thumb_url || m.poster_url),
    time: resumeTime,
    duration: sameEp ? (prev.duration || 0) : 0,
  });

  showScreen('player');
  const isMovie = eps.length === 1;
  document.getElementById('player-title').textContent =
    ((m && m.name) || '') + (isMovie ? '' : ' — ' + ep.name);
  document.getElementById('seek-fill').style.width  = '0%';
  document.getElementById('player-time').textContent = '0:00 / 0:00';
  showOverlayPersistent();

  startPlayback(url, resumeTime);
}

function startPlayback(url, resumeTime) {
  const video = document.getElementById('video');
  if (!video) return;

  if (_hls) { _hls.destroy(); _hls = null; }

  video.ontimeupdate = updatePlayerBar;
  video.onended      = playNext;
  video.onloadedmetadata = function() {
    if (resumeTime && resumeTime > 5 && video.duration && resumeTime < video.duration - 2) {
      try { video.currentTime = resumeTime; } catch (_) {}
    }
  };

  if (window.Hls && window.Hls.isSupported()) {
    _hls = new window.Hls({
      maxBufferLength: 60,
      maxMaxBufferLength: 120,
      maxBufferSize: 90 * 1000 * 1000,
      fragLoadingMaxRetry: 8,
      fragLoadingRetryDelay: 1000,
      manifestLoadingMaxRetry: 6,
      levelLoadingMaxRetry: 6,
    });
    _hls.loadSource(url);
    _hls.attachMedia(video);
    _hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
      video.play().catch(function() {});
    });
  } else {
    video.src = url;
    video.play().catch(function() {});
  }
  showOverlay();
}

function stopPlayback() {
  const video = document.getElementById('video');
  if (video) {
    if (video.duration && state.currentSlug) {
      saveHistory(state.currentSlug, { epIdx: state.currentEpIdx, time: video.currentTime, duration: video.duration });
    }
    video.src = ''; video.ontimeupdate = null; video.onended = null; video.onloadedmetadata = null;
  }
  if (_hls) { _hls.destroy(); _hls = null; }
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
  const fmt = function(t) { return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0'); };
  document.getElementById('player-time').textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration);
  document.getElementById('seek-fill').style.width   = ((video.currentTime / video.duration) * 100) + '%';
  const now = Date.now();
  if (now - _lastProgressSave > 5000) {
    _lastProgressSave = now;
    saveHistory(state.currentSlug, { epIdx: state.currentEpIdx, time: video.currentTime, duration: video.duration });
  }
}

function showOverlay() {
  const overlay = document.getElementById('player-overlay');
  if (!overlay) return;
  overlay.classList.add('visible');
  clearTimeout(state.overlayTimer);
  state.overlayTimer = setTimeout(function() { overlay.classList.remove('visible'); }, 3500);
}

function showOverlayPersistent() {
  clearTimeout(state.overlayTimer);
  const overlay = document.getElementById('player-overlay');
  if (overlay) overlay.classList.add('visible');
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
    if (video) video.paused ? video.play().catch(function() {}) : video.pause();
  } else if (k === KEY.RIGHT || k === KEY.FF) {
    if (video) video.currentTime += 10;
  } else if (k === KEY.LEFT || k === KEY.REW) {
    if (video) video.currentTime = Math.max(0, video.currentTime - 10);
  } else { return false; }

  return true;
}

// ── Watch history ─────────────────────────────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem('tizenphim_watchHistory') || '{}'); } catch (_) { return {}; }
}

function saveHistory(slug, patch) {
  if (!slug) return;
  try {
    const h = getHistory();
    h[slug] = Object.assign({}, h[slug], patch, { ts: Date.now() });
    localStorage.setItem('tizenphim_watchHistory', JSON.stringify(h));
  } catch (_) {}
}

function buildContinueWatching() {
  const h = getHistory();
  return Object.entries(h)
    .filter(function(pair) { return pair[1].name; })
    .sort(function(a, b) { return b[1].ts - a[1].ts; })
    .slice(0, 20)
    .map(function(pair) {
      const slug = pair[0], v = pair[1];
      return { slug: slug, name: v.name, thumb_url: v.poster || '', poster_url: v.poster || '', _progress: (v.duration && v.time) ? Math.min(1, Math.max(0, v.time / v.duration)) : null };
    });
}

// ── Favorites ───────────────────────────────────────────────────────────────
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('tizenphim_favorites') || '{}'); } catch (_) { return {}; }
}

function isFavorite(slug) {
  return !!getFavorites()[slug];
}

function toggleFavorite(slug, name, poster) {
  if (!slug) return false;
  try {
    const f = getFavorites();
    if (f[slug]) { delete f[slug]; localStorage.setItem('tizenphim_favorites', JSON.stringify(f)); return false; }
    f[slug] = { slug: slug, name: name, poster: poster, ts: Date.now() };
    localStorage.setItem('tizenphim_favorites', JSON.stringify(f));
    return true;
  } catch (_) { return false; }
}

function buildFavorites() {
  const f = getFavorites();
  return Object.keys(f)
    .map(function(slug) { return f[slug]; })
    .filter(function(v) { return v && v.name; })
    .sort(function(a, b) { return b.ts - a.ts; })
    .slice(0, 40)
    .map(function(v) {
      return { slug: v.slug, name: v.name, thumb_url: v.poster || '', poster_url: v.poster || '' };
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str != null ? str : '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
