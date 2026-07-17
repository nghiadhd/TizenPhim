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

const HEART_SVG = '<svg class="heart-icon" viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="currentColor">' +
  '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

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
  prevScreen: 'browse',

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

  hero:              { item: null, loading: false, zone: 'play' },
  homeRowZone:       'hero',
  homeSidebarFocus:  0,
  homeSidebarReturnZone: 'hero', // zone to restore when leaving the sidebar — 'hero' or 'row'
  rows:              [],
  rowFocusIndex:     0,

  homeMode: 'rows',
  catGrid: {
    catId: null, catName: '',
    items: [], page: 1, hasMore: false, loading: false, loadingMore: false, focus: 0,
    heroItem: null,
  },

  playerZone:          'controls',
  playerControlIndex:  1,
  currentStreamUrl:    null,
  playerSettingsOpen:  false,
  playerSettingsFocus: 0,
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
  // The `_` cache-buster stops the Tizen webview from serving a stale cached
  // response — without it, different queries could return the last result set.
  const r = await fetch(API + '/v1/api/tim-kiem?keyword=' + encodeURIComponent(query) + '&limit=24' + '&_=' + Date.now());
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
function getFocusedRemovableItem() {
  if (state.screen === 'home' && state.homeRowZone === 'row') {
    const row = state.rows[state.rowFocusIndex];
    if (!row || !row.loaded) return null;
    const item = row.items[row.focus];
    if (!item) return null;
    return { catId: row.catId, slug: item.slug, name: item.name, fromScreen: 'home' };
  }
  if (state.screen === 'browse' && state.homeZone === 'grid') {
    const item = state.grid.items[state.grid.focus];
    if (!item) return null;
    return { catId: state.grid.catId, slug: item.slug, name: item.name, fromScreen: 'browse' };
  }
  if (state.screen === 'home' && state.homeMode === 'category' && state.homeRowZone === 'grid') {
    const g = state.catGrid;
    if (!LOCAL_BUILDERS[g.catId]) return null;
    const item = g.items[g.focus];
    if (!item) return null;
    return { catId: g.catId, slug: item.slug, name: item.name, fromScreen: 'home' };
  }
  return null;
}

function startEnterPress(target) {
  if (_pressTimer || state.confirmDialog) return;
  _pressFired = false;
  _enterHeld  = true;
  _pressTarget = target;
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
      state.prevScreen = _pressTarget.fromScreen;
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

// Position a to-be-inserted local row so state.rows stays in the same order
// buildHomeRows() would have produced, by counting how many earlier CATALOGS
// entries already have a row present.
function homeRowInsertIndex(catId) {
  const targetIdx = CATALOGS.findIndex(function(c) { return c.id === catId; });
  let insertAt = 0;
  for (let i = 0; i < targetIdx; i++) {
    const c = CATALOGS[i];
    if (c.id === 'search') continue;
    if (state.rows.some(function(r) { return r.catId === c.id; })) insertAt++;
  }
  return insertAt;
}

// Shared by favorite/continue-watching add, remove, and update paths: refreshes an
// existing local row in place, or creates+inserts it (buildHomeRows() skipped it at
// startup because the list was empty then) if it's missing but now has items.
function syncLocalRow(catId) {
  if (!LOCAL_BUILDERS[catId]) return;
  const items = LOCAL_BUILDERS[catId]();
  const row = state.rows.find(function(r) { return r.catId === catId; });

  if (row) {
    row.items = items;
    if (row.focus > row.items.length - 1) row.focus = Math.max(0, row.items.length - 1);
    renderHomeRow(row);
  } else if (items.length) {
    const cat = CATALOGS.find(function(c) { return c.id === catId; });
    if (!cat) return;
    const insertAt = homeRowInsertIndex(catId);
    state.rows.splice(insertAt, 0, {
      catId: cat.id, catName: cat.name, isLocal: true, items: items,
      loading: false, loaded: true, focus: 0, page: 1, hasMore: false,
    });
    // Inserting shifts every row's index (data-row-index / #home-row-track-N),
    // so state.rowFocusIndex must be adjusted to keep pointing at the same row.
    if (state.rowFocusIndex >= insertAt) state.rowFocusIndex++;
    renderHomeRows();
  }
  renderHomeSidebar();
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
    renderBrowseScreen();
  }
  if (state.catGrid.catId === catId && LOCAL_BUILDERS[catId]) {
    state.catGrid.items = LOCAL_BUILDERS[catId]();
    if (state.catGrid.focus > state.catGrid.items.length - 1) state.catGrid.focus = Math.max(0, state.catGrid.items.length - 1);
    renderCategoryGrid();
    renderHomeScreen();
  }
  syncLocalRow(catId);
}

function onKey(e) {
  const k = e.keyCode;
  if (state.confirmDialog) { if (handleConfirmDialog(k)) e.preventDefault(); return; }
  if (state.debugOpen) { closeDebugPanel(); e.preventDefault(); return; }
  if (state.playerSettingsOpen) { if (handlePlayerSettings(k)) e.preventDefault(); return; }
  if (k === KEY.ENTER) {
    const target = getFocusedRemovableItem();
    if (target && REMOVABLE_CATS[target.catId]) {
      e.preventDefault();
      startEnterPress(target);
      return;
    }
  }
  if (state.screen === 'home')   { if (handleHomeScreen(k)) e.preventDefault(); return; }
  if (state.screen === 'browse') { if (handleBrowse(k)) e.preventDefault(); return; }
  if (state.screen === 'search') { if (handleSearch(k)) e.preventDefault(); return; }
  if (state.screen === 'detail') { if (handleDetail(k)) e.preventDefault(); return; }
  if (state.screen === 'player') { if (handlePlayer(k)) e.preventDefault(); return; }
}

// ── Home (hero) ──────────────────────────────────────────────────────────────
const HERO_SOURCE_CAT = 'phim-moi';

function showHome() {
  showScreen('home');
  if (!state.rows.length) {
    state.rows = buildHomeRows();
    renderHomeRows();
  }
  if (!state.hero.item && !state.hero.loading) loadHomeHero();
  renderHomeScreen();
}

async function loadHomeHero() {
  state.hero.loading = true;
  renderHomeScreen();
  try {
    const items = await fetchCatalog(HERO_SOURCE_CAT, 1);
    state.hero.item = items[0] || null;
    const heroRow = state.rows.find(function(r) { return r.catId === HERO_SOURCE_CAT; });
    if (heroRow && !heroRow.loaded) {
      heroRow.items   = items;
      heroRow.loading = false;
      heroRow.loaded  = true;
      heroRow.hasMore = items.length >= 10;
      renderHomeRow(heroRow);
    }
  } catch (_) {}
  state.hero.loading = false;
  renderHomeScreen();
}

function getDisplayedHeroItem() {
  if (state.homeMode === 'category') {
    const g = state.catGrid;
    if (state.homeRowZone === 'grid' && g.items[g.focus]) {
      // Sticks so that jumping back to hero (BACK / UP-at-top) keeps showing
      // whatever card was last focused, instead of resetting to items[0].
      g.heroItem = g.items[g.focus];
    }
    return g.heroItem || g.items[0] || null;
  }
  if (state.homeRowZone === 'row') {
    const row = state.rows[state.rowFocusIndex];
    if (row && row.loaded && row.items[row.focus]) {
      // Same stickiness for rows mode: keep the last-hovered row item as the
      // hero content once focus moves away from the row, so Play/Info act on
      // the film the user was actually looking at.
      state.hero.item = row.items[row.focus];
    }
  }
  return state.hero.item;
}

const HOME_SIDEBAR_ALL_IDS = [
  'home-nav-home', 'home-search-btn', 'home-nav-continue', 'home-nav-favorite',
  'home-nav-movies', 'home-nav-series',
];

function getHomeSidebarIds() {
  const ids = ['home-nav-home', 'home-search-btn'];
  const continueRow = state.rows.find(function(r) { return r.catId === 'continue'; });
  const favRow      = state.rows.find(function(r) { return r.catId === 'favorite'; });
  if (continueRow && continueRow.items.length) ids.push('home-nav-continue');
  if (favRow && favRow.items.length)           ids.push('home-nav-favorite');
  ids.push('home-nav-movies', 'home-nav-series');
  return ids;
}

function renderHomeSidebar() {
  const ids = getHomeSidebarIds();
  HOME_SIDEBAR_ALL_IDS.forEach(function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('hidden', ids.indexOf(id) === -1);
    el.classList.remove('focused');
  });
  const sidebarEl = document.getElementById('home-sidebar');
  if (sidebarEl) sidebarEl.classList.toggle('expanded', state.homeRowZone === 'sidebar');
  if (state.homeRowZone === 'sidebar') {
    const activeId = ids[state.homeSidebarFocus];
    const el = activeId && document.getElementById(activeId);
    if (el) el.classList.add('focused');
  }
}

function updateHomeSectionVisibility() {
  const rowsEl = document.getElementById('home-rows');
  const gridEl = document.getElementById('home-catgrid');
  const isCategory = state.homeMode === 'category';
  if (rowsEl) rowsEl.classList.toggle('hidden', isCategory);
  if (gridEl) gridEl.classList.toggle('hidden', !isCategory);
}

function renderHomeScreen() {
  renderHomeSidebar();
  updateHomeSectionVisibility();

  const item      = getDisplayedHeroItem();
  const backdrop  = document.getElementById('home-hero-backdrop');
  const title     = document.getElementById('home-hero-title');
  const tags      = document.getElementById('home-hero-tags');
  const desc      = document.getElementById('home-hero-desc');
  const playBtn   = document.getElementById('home-hero-play');
  const infoBtn   = document.getElementById('home-hero-info');
  const loadingEl = document.getElementById('home-hero-loading');

  const heroLoading = state.homeMode === 'category'
    ? (state.catGrid.loading && !state.catGrid.items.length)
    : state.hero.loading;
  if (loadingEl) loadingEl.classList.toggle('hidden', !heroLoading);

  if (item) {
    if (backdrop) backdrop.style.backgroundImage = 'url(\'' + escHtml(imgUrl(item.thumb_url || item.poster_url)) + '\')';
    if (title) title.textContent = item.name || '';
    if (tags) {
      tags.innerHTML = [
        item.quality ? '<span class="tag quality">' + escHtml(item.quality) + '</span>' : '',
        item.lang    ? '<span class="tag">' + escHtml(item.lang) + '</span>' : '',
        item.year    ? '<span class="tag">' + escHtml(String(item.year)) + '</span>' : '',
      ].filter(Boolean).join('');
    }
    if (desc) desc.textContent = item.origin_name || '';
  } else {
    if (backdrop) backdrop.style.backgroundImage = '';
    if (title) title.textContent = '';
    if (tags) tags.innerHTML = '';
    if (desc) desc.textContent = '';
  }

  if (playBtn) playBtn.classList.toggle('focused', state.homeRowZone === 'hero' && state.hero.zone === 'play');
  if (infoBtn) infoBtn.classList.toggle('focused', state.homeRowZone === 'hero' && state.hero.zone === 'info');
}

function handleHomeScreen(k) {
  // BACK steps back one level at a time within a category page: from the grid it
  // jumps to that page's own hero first (handled in handleHomeCategoryGridKey);
  // only pressing BACK again once already at the hero exits the category page.
  if ((k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) && state.homeMode === 'category' && state.homeRowZone === 'hero') {
    exitCategoryGrid();
    return true;
  }
  if (state.homeRowZone === 'sidebar') return handleHomeSidebarKey(k);
  if (state.homeRowZone === 'hero')    return handleHomeHeroKey(k);
  if (state.homeRowZone === 'grid')    return handleHomeCategoryGridKey(k);
  return handleHomeRowKey(k);
}

// Restores whichever zone the user was in before entering the sidebar (hero or a
// specific row+card), instead of always dumping them back on the hero banner —
// used when backing out of the sidebar via RIGHT or the Trang Chủ button.
function leaveSidebarZone() {
  const i   = state.rowFocusIndex;
  const row = state.rows[i];
  if (state.homeSidebarReturnZone === 'row' && row && row.loaded) {
    state.homeRowZone = 'row';
    renderHomeScreen();
    updateHomeRowShellFocus(i);
    updateHomeRowCardFocus(null, i, true);
    scrollHomeRowIntoView(i);
  } else {
    state.homeRowZone = 'hero';
    renderHomeScreen();
  }
}

function handleHomeSidebarKey(k) {
  const ids = getHomeSidebarIds();
  if (k === KEY.RIGHT) {
    leaveSidebarZone();
    return true;
  } else if (k === KEY.UP) {
    state.homeSidebarFocus = Math.max(0, state.homeSidebarFocus - 1);
  } else if (k === KEY.DOWN) {
    state.homeSidebarFocus = Math.min(ids.length - 1, state.homeSidebarFocus + 1);
  } else if (k === KEY.ENTER) {
    activateHomeSidebarIcon(ids[state.homeSidebarFocus]);
    return true;
  } else { return false; }
  renderHomeScreen();
  return true;
}

function activateHomeSidebarIcon(id) {
  if (id === 'home-nav-home') {
    // Only exits category-grid mode (if in one) — deliberately does NOT scroll to
    // top or reset focus to hero, so it doesn't disturb whatever row/card the user
    // already had selected.
    state.homeMode = 'rows';
    leaveSidebarZone();
  } else if (id === 'home-search-btn') {
    showSearch();
  } else if (id === 'home-nav-continue') {
    openCategoryGrid('continue');
  } else if (id === 'home-nav-favorite') {
    openCategoryGrid('favorite');
  } else if (id === 'home-nav-movies') {
    openCategoryGrid('phim-le');
  } else if (id === 'home-nav-series') {
    openCategoryGrid('phim-bo');
  }
}

function openCategoryGrid(catId) {
  const cat = CATALOGS.find(function(c) { return c.id === catId; });
  if (!cat) return;
  state.homeMode    = 'category';
  state.homeRowZone = 'hero';
  state.catGrid = {
    catId: cat.id, catName: cat.name,
    items: [], page: 1, hasMore: false, loading: true, loadingMore: false, focus: 0,
    heroItem: null,
  };
  const scrollEl = document.getElementById('home-scroll');
  if (scrollEl) scrollEl.scrollTo({ top: 0 });
  renderHomeScreen();
  renderCategoryGrid();
  loadCategoryGrid();
}

function exitCategoryGrid() {
  state.homeMode     = 'rows';
  state.homeRowZone  = 'hero';
  renderHomeScreen();
}

async function loadCategoryGrid() {
  const g = state.catGrid;
  if (LOCAL_BUILDERS[g.catId]) {
    g.items   = LOCAL_BUILDERS[g.catId]();
    g.hasMore = false;
    g.loading = false;
    renderHomeScreen();
    renderCategoryGrid();
    return;
  }
  try {
    const items = await fetchCatalog(g.catId, g.page);
    g.items   = g.items.concat(items);
    g.hasMore = items.length >= 10;
  } catch (_) {}
  g.loading = false;
  renderHomeScreen();
  renderCategoryGrid();
}

async function loadMoreCategoryGrid() {
  const g = state.catGrid;
  if (g.loading || g.loadingMore || !g.hasMore) return;
  g.loadingMore = true;
  g.page++;
  renderCategoryGrid();
  try {
    const more = await fetchCatalog(g.catId, g.page);
    g.items   = g.items.concat(more);
    g.hasMore = more.length >= 10;
  } catch (_) {}
  g.loadingMore = false;
  renderCategoryGrid();
}

function renderCategoryGrid() {
  const g       = state.catGrid;
  const titleEl = document.getElementById('home-catgrid-title');
  const gridEl  = document.getElementById('home-catgrid-items');
  if (!gridEl) return;
  if (titleEl) titleEl.textContent = g.catName || '';

  const inGrid   = state.homeRowZone === 'grid';
  const maxFocus = g.items.length - 1 + (g.hasMore ? 1 : 0);
  if (maxFocus >= 0 && g.focus > maxFocus) g.focus = maxFocus;

  if (g.loading && !g.items.length) {
    gridEl.innerHTML = new Array(12).fill(0).map(function() {
      return '<div class="card"><div class="card-poster loading-card"></div><div class="card-title">&nbsp;</div></div>';
    }).join('');
    return;
  }

  const cardsHtml = g.items.map(function(m, i) {
    return '<div class="card ' + (inGrid && i === g.focus ? 'focused' : '') + '">' +
      '<div class="card-poster" style="background-image:url(\'' + escHtml(imgUrl(m.poster_url || m.thumb_url)) + '\')">' +
        (m._progress != null ? '<div class="card-progress"><div class="card-progress-fill" style="width:' + Math.round(m._progress * 100) + '%"></div></div>' : '') +
      '</div>' +
      '<div class="card-title">' + escHtml(m.name) + '</div>' +
      '</div>';
  }).join('');

  const loadMoreIdx  = g.items.length;
  const loadMoreHtml = g.hasMore
    ? '<div class="card card-load-more ' + (inGrid && loadMoreIdx === g.focus ? 'focused' : '') + '">' +
        '<div class="card-load-more-icon">' + (g.loadingMore ? '…' : '+') + '</div>' +
        '<div class="card-title">Tải thêm</div>' +
      '</div>'
    : '';

  gridEl.innerHTML = cardsHtml + loadMoreHtml;

  requestAnimationFrame(function() {
    const fc = gridEl.querySelector('.card.focused');
    if (fc) { fc.scrollIntoView({ block: 'nearest', inline: 'nearest' }); marqueeTitle(fc); }
  });
}

function handleHomeCategoryGridKey(k) {
  const g     = state.catGrid;
  const items = g.items;
  const totalCount = items.length + (g.hasMore ? 1 : 0);
  const max   = totalCount - 1;
  const cols  = HOME_GRID_COLS;
  const col   = g.focus % cols;
  const row   = Math.floor(g.focus / cols);

  if (max < 0) return false;

  const oldFocus = g.focus;
  let focusOnly  = false;

  if (k === KEY.UP) {
    if (row === 0) {
      state.homeRowZone = 'hero';
      renderHomeScreen();
      return true;
    }
    g.focus = Math.max(0, g.focus - cols);
    focusOnly = true;
  } else if (k === KEY.DOWN) {
    const next = g.focus + cols;
    if (next > max) return false;
    g.focus = next;
    focusOnly = true;
  } else if (k === KEY.LEFT) {
    if (col === 0) {
      state.homeRowZone = 'sidebar';
      renderHomeScreen();
      return true;
    }
    g.focus--;
    focusOnly = true;
  } else if (k === KEY.RIGHT) {
    if (g.focus >= max) return false;
    g.focus++;
    focusOnly = true;
  } else if (k === KEY.ENTER) {
    if (g.hasMore && g.focus === items.length) { loadMoreCategoryGrid(); return true; }
    const item = items[g.focus];
    if (item) { state.prevScreen = 'home'; showDetail(item.slug); }
    return true;
  } else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    // Quick jump to this category page's own hero from any grid depth — mirrors
    // the row-list version. handleHomeScreen only exits the category page on a
    // second BACK once already at the hero, so this doesn't skip a level.
    state.homeRowZone = 'hero';
    renderHomeScreen();
    return true;
  } else { return false; }

  if (focusOnly) {
    updateGridFocus(document.getElementById('home-catgrid-items'), oldFocus, g.focus, true);
    renderHomeScreen();
  }
  return true;
}

function handleHomeHeroKey(k) {
  if (k === KEY.RIGHT) {
    state.hero.zone = 'info';
  } else if (k === KEY.LEFT) {
    if (state.hero.zone === 'info') { state.hero.zone = 'play'; }
    else { state.homeRowZone = 'sidebar'; state.homeSidebarReturnZone = 'hero'; }
  } else if (k === KEY.UP) {
    state.homeRowZone = 'sidebar';
    state.homeSidebarReturnZone = 'hero';
  } else if (k === KEY.DOWN) {
    if (state.homeMode === 'category') {
      if (!state.catGrid.items.length) return false;
      state.homeRowZone = 'grid';
      renderHomeScreen();
      renderCategoryGrid();
      return true;
    }
    if (!state.rows.length) return false;
    enterHomeRowZone(0);
    return true;
  } else if (k === KEY.ENTER) {
    const item = getDisplayedHeroItem();
    if (!item) return true;
    state.prevScreen = 'home';
    showDetail(item.slug, state.hero.zone === 'play');
    return true;
  } else { return false; }
  renderHomeScreen();
  return true;
}

function handleHomeRowKey(k) {
  const i   = state.rowFocusIndex;
  const row = state.rows[i];
  if (!row) return false;

  if (k === KEY.UP) {
    if (i === 0) {
      state.homeRowZone = 'hero';
      updateHomeRowShellFocus(i);
      updateHomeRowCardFocus(i, null, false);
      renderHomeScreen();
    } else {
      moveHomeRowFocus(i - 1);
    }
    return true;
  }
  if (k === KEY.DOWN) {
    if (i >= state.rows.length - 1) return false;
    moveHomeRowFocus(i + 1);
    return true;
  }
  if (k === KEY.LEFT) {
    if (!row.loaded || row.focus <= 0) {
      state.homeRowZone = 'sidebar';
      state.homeSidebarReturnZone = 'row';
      updateHomeRowShellFocus(i);
      updateHomeRowCardFocus(i, null, false);
      renderHomeScreen();
      return true;
    }
    const oldFocus = row.focus;
    row.focus--;
    updateGridFocus(document.getElementById('home-row-track-' + i), oldFocus, row.focus, true);
    renderHomeScreen();
    return true;
  }
  if (k === KEY.RIGHT) {
    if (!row.loaded) return false;
    const maxFocus = row.items.length - 1 + (row.hasMore ? 1 : 0);
    if (row.focus >= maxFocus) return false;
    const oldFocus = row.focus;
    row.focus++;
    updateGridFocus(document.getElementById('home-row-track-' + i), oldFocus, row.focus, true);
    renderHomeScreen();
    return true;
  }
  if (k === KEY.ENTER) {
    if (!row.loaded) return true;
    if (row.hasMore && row.focus === row.items.length) { loadMoreHomeRow(row); return true; }
    const item = row.items[row.focus];
    if (item) { state.prevScreen = 'home'; showDetail(item.slug); }
    return true;
  }
  if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    // Quick jump to the hero from any row depth — the hero is already always
    // visible (sticky), so this is purely a focus move, no scrolling involved.
    state.homeRowZone = 'hero';
    updateHomeRowShellFocus(i);
    updateHomeRowCardFocus(i, null, false);
    renderHomeScreen();
    return true;
  }
  return false;
}

function enterHomeRowZone(index) {
  state.homeRowZone   = 'row';
  state.rowFocusIndex = index;
  ensureRowLoaded(state.rows[index]);
  renderHomeScreen();
  updateHomeRowShellFocus(index);
  updateHomeRowCardFocus(null, index, true);
  scrollHomeRowIntoView(index);
}

function moveHomeRowFocus(newIndex) {
  const oldIndex = state.rowFocusIndex;
  state.rowFocusIndex = newIndex;
  ensureRowLoaded(state.rows[newIndex]);
  updateHomeRowShellFocus(oldIndex);
  updateHomeRowShellFocus(newIndex);
  updateHomeRowCardFocus(oldIndex, newIndex, true);
  renderHomeScreen();
  scrollHomeRowIntoView(newIndex);
}

function updateHomeRowShellFocus(i) {
  const shellEl = document.querySelector('.home-row[data-row-index="' + i + '"]');
  if (shellEl) shellEl.classList.toggle('focused', state.homeRowZone === 'row' && state.rowFocusIndex === i);
}

// Row-aware wrapper around the updateGridFocus pattern: updateGridFocus itself only
// handles a single container, but moving focus between rows means blurring a card in
// one row's track and focusing a card in a *different* row's track. Pass null for
// either side when there's nothing to blur/focus on that side (e.g. entering/leaving
// row zone entirely).
function updateHomeRowCardFocus(oldRowIndex, newRowIndex, marquee) {
  if (oldRowIndex != null) {
    const oldRow = state.rows[oldRowIndex];
    if (oldRow && oldRow.loaded) {
      const oldTrack = document.getElementById('home-row-track-' + oldRowIndex);
      const oldCard  = oldTrack && oldTrack.children[oldRow.focus];
      if (oldCard) { oldCard.classList.remove('focused'); stopCardMarquee(oldCard); }
    }
  }
  if (newRowIndex != null) {
    const newRow = state.rows[newRowIndex];
    if (newRow && newRow.loaded) {
      const newTrack = document.getElementById('home-row-track-' + newRowIndex);
      const newCard  = newTrack && newTrack.children[newRow.focus];
      if (newCard) {
        newCard.classList.add('focused');
        requestAnimationFrame(function() {
          newCard.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          if (marquee) marqueeTitle(newCard);
        });
      }
    }
  }
}

function scrollHomeRowIntoView(i) {
  const shellEl = document.querySelector('.home-row[data-row-index="' + i + '"]');
  if (shellEl) requestAnimationFrame(function() { shellEl.scrollIntoView({ block: 'nearest' }); });
}

function buildHomeRows() {
  const rows = [];
  CATALOGS.forEach(function(cat) {
    if (cat.id === 'search') return;
    if (LOCAL_BUILDERS[cat.id]) {
      const items = LOCAL_BUILDERS[cat.id]();
      if (!items.length) return;
      rows.push({ catId: cat.id, catName: cat.name, isLocal: true, items: items, loading: false, loaded: true, focus: 0, page: 1, hasMore: false });
    } else {
      const isHeroSource = cat.id === HERO_SOURCE_CAT;
      rows.push({ catId: cat.id, catName: cat.name, isLocal: false, items: [], loading: isHeroSource, loaded: false, focus: 0, page: 1, hasMore: false });
    }
  });
  return rows;
}

function renderHomeRows() {
  const el = document.getElementById('home-rows');
  if (!el) return;
  el.innerHTML = state.rows.map(function(row, i) {
    return '<div class="home-row" data-row-index="' + i + '">' +
      '<div class="home-row-title">' + escHtml(row.catName) + '</div>' +
      '<div class="home-row-track" id="home-row-track-' + i + '"></div>' +
      '</div>';
  }).join('');
  state.rows.forEach(function(row, i) { renderHomeRowTrack(row, i); });
  observeHomeRows();
}

function renderHomeRow(row) {
  const i = state.rows.indexOf(row);
  if (i === -1) return;
  renderHomeRowTrack(row, i);
  if (row.loaded && _homeRowObserver) {
    const el = document.querySelector('.home-row[data-row-index="' + i + '"]');
    if (el) _homeRowObserver.unobserve(el);
  }
  if (state.homeRowZone === 'row' && state.rowFocusIndex === i) renderHomeScreen();
}

function renderHomeRowTrack(row, i) {
  const track = document.getElementById('home-row-track-' + i);
  if (!track) return;
  const isFocusedRow = state.homeRowZone === 'row' && state.rowFocusIndex === i;

  if (!row.loaded) {
    track.innerHTML = new Array(6).fill(0).map(function() {
      return '<div class="card"><div class="card-poster loading-card"></div><div class="card-title">&nbsp;</div></div>';
    }).join('');
    return;
  }

  const cardsHtml = row.items.map(function(m, ci) {
    return '<div class="card ' + (isFocusedRow && ci === row.focus ? 'focused' : '') + '">' +
      '<div class="card-poster" style="background-image:url(\'' + escHtml(imgUrl(m.poster_url || m.thumb_url)) + '\')">' +
        (m._progress != null ? '<div class="card-progress"><div class="card-progress-fill" style="width:' + Math.round(m._progress * 100) + '%"></div></div>' : '') +
      '</div>' +
      '<div class="card-title">' + escHtml(m.name) + '</div>' +
      '</div>';
  }).join('');

  const loadMoreIdx  = row.items.length;
  const loadMoreHtml = row.hasMore
    ? '<div class="card card-load-more ' + (isFocusedRow && loadMoreIdx === row.focus ? 'focused' : '') + '">' +
        '<div class="card-load-more-icon">' + (row.loadingMore ? '…' : '+') + '</div>' +
        '<div class="card-title">Tải thêm</div>' +
      '</div>'
    : '';

  track.innerHTML = cardsHtml + loadMoreHtml;

  if (isFocusedRow) {
    requestAnimationFrame(function() {
      const fc = track.querySelector('.card.focused');
      if (fc) { fc.scrollIntoView({ block: 'nearest', inline: 'nearest' }); marqueeTitle(fc); }
    });
  }
}

let _homeRowObserver = null;
let _activeRowFetches = 0;
const MAX_CONCURRENT_ROW_FETCHES = 3;
let _pendingRowFetches = [];

function ensureRowLoaded(row) {
  if (!row || row.loaded || row.loading) return;
  row.loading = true;
  _pendingRowFetches.push(row);
  _drainRowFetchQueue();
}

function _drainRowFetchQueue() {
  while (_activeRowFetches < MAX_CONCURRENT_ROW_FETCHES && _pendingRowFetches.length) {
    const row = _pendingRowFetches.shift();
    _activeRowFetches++;
    fetchCatalog(row.catId, 1)
      .then(function(items) { row.items = items; row.hasMore = items.length >= 10; })
      .catch(function() { row.items = []; row.hasMore = false; })
      .then(function() {
        row.loading = false;
        row.loaded  = true;
        _activeRowFetches--;
        renderHomeRow(row);
        _drainRowFetchQueue();
      });
  }
}

async function loadMoreHomeRow(row) {
  if (row.isLocal || !row.hasMore || row.loadingMore) return;
  row.loadingMore = true;
  const i = state.rows.indexOf(row);
  renderHomeRowTrack(row, i);
  try {
    const more = await fetchCatalog(row.catId, row.page + 1);
    row.items   = row.items.concat(more);
    row.page++;
    row.hasMore = more.length >= 10;
  } catch (_) {
    row.hasMore = false;
  }
  row.loadingMore = false;
  renderHomeRowTrack(row, i);
}

function observeHomeRows() {
  if (_homeRowObserver) { _homeRowObserver.disconnect(); }
  if (!window.IntersectionObserver) {
    state.rows.forEach(function(row) { ensureRowLoaded(row); });
    return;
  }
  const root = document.getElementById('home-scroll');
  _homeRowObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      const idx = Number(entry.target.getAttribute('data-row-index'));
      const row = state.rows[idx];
      if (row) ensureRowLoaded(row);
    });
  }, { root: root, rootMargin: '0px 0px 900px 0px' });

  document.querySelectorAll('.home-row').forEach(function(el) {
    const idx = Number(el.getAttribute('data-row-index'));
    const row = state.rows[idx];
    if (row && !row.loaded) _homeRowObserver.observe(el);
  });
}

// ── Browse ────────────────────────────────────────────────────────────────────
let _sidebarDebounce = null;
let _lastProgressSave = 0;
let _hls = null;
let _stallTimer = null;

function showBrowse() {
  showScreen('browse');
  if (!state.grid.catId) { loadHomeGrid(CATALOGS[state.sidebarFocus]); return; }
  if (LOCAL_BUILDERS[state.grid.catId]) {
    const keep = state.grid.focus;
    state.grid.items = LOCAL_BUILDERS[state.grid.catId]();
    state.grid.focus = Math.min(keep, Math.max(0, state.grid.items.length - 1));
  }
  renderBrowseScreen();
}

function renderBrowseScreen() {
  const home = document.getElementById('screen-browse');
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
  const dur = Math.max(9000, shift * 70);
  // Fixed 2s pause before scrolling starts, regardless of title length/duration
  // (a flat offset fraction like 0.35 would stretch the pause out on long titles).
  const startOffset = 2000 / dur;
  scroll.animate([
    { transform: 'translateX(0)',            offset: 0 },
    { transform: 'translateX(0)',            offset: startOffset },
    { transform: 'translateX(' + (-shift) + 'px)', offset: 0.85 },
    { transform: 'translateX(' + (-shift) + 'px)', offset: 1    },
  ], { duration: dur, iterations: Infinity, easing: 'linear' });
}

function stopCardMarquee(card) {
  const title  = card && card.querySelector('.card-title');
  const scroll = title && title.querySelector('.card-title-scroll');
  if (!scroll) return;
  const piece = scroll.querySelector('.cts-piece');
  // Collapsing back to plain text discards the animated node (and with it
  // the running Web Animation), instead of leaving it playing forever on a
  // card that's no longer focused.
  title.innerHTML = piece ? piece.innerHTML : title.textContent;
}

function updateGridFocus(containerEl, oldIndex, newIndex, marquee) {
  const cards = containerEl.children;
  if (cards[oldIndex]) {
    cards[oldIndex].classList.remove('focused');
    stopCardMarquee(cards[oldIndex]);
  }
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
  renderBrowseScreen();
  try {
    const items = LOCAL_BUILDERS[cat.id] ? LOCAL_BUILDERS[cat.id]() : await fetchCatalog(cat.id, 1);
    state.grid.items   = items;
    state.grid.hasMore = !cat.local && items.length >= 10;
  } catch (_) {}
  state.grid.loading = false;
  renderBrowseScreen();
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
  renderBrowseScreen();
}

function handleBrowse(k) {
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
    if (!needsLoad) renderBrowseScreen();
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

function handleGridKey(k) {
  const { items, focus, hasMore, loading } = state.grid;
  const totalCount = items.length + (hasMore ? 1 : 0);
  const max        = totalCount - 1;
  const cols       = HOME_GRID_COLS;
  const col        = focus % cols;
  const row        = Math.floor(focus / cols);
  const totalRows  = Math.ceil(totalCount / cols);

  if (max < 0 && k !== KEY.LEFT && k !== KEY.BACK && k !== KEY.ESC && k !== KEY.BACKSPACE) return false;

  let focusOnly = false;

  if (k === KEY.LEFT) {
    if (col === 0) { state.homeZone = 'sidebar'; renderBrowseScreen(); return true; }
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
    if (item) { state.prevScreen = 'browse'; showDetail(item.slug); }
    return true;
  } else if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    state.homeZone = 'sidebar';
  } else { return false; }

  if (focusOnly) {
    updateGridFocus(document.getElementById('home-grid'), focus, state.grid.focus, true);
  } else {
    renderBrowseScreen();
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
    if (k === KEY.BACK || k === KEY.ESC) { showHome(); return true; }
    // Backspace on a real keyboard (or an IME composing tone marks, which can send a
    // transient Backspace mid-word) must delete text, not exit — only treat it as the
    // TV remote's Back signal once the field is already empty, so a further press has
    // nothing left to delete.
    if (k === KEY.BACKSPACE && !state.search.query) { showHome(); return true; }
    return false;
  }

  const max  = items.length - 1;
  const cols = SEARCH_COLS;
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
async function showDetail(slug, autoplay) {
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
    if (autoplay) playEpisode(state.focusEp);
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
          HEART_SVG + (isFavorite(slug) ? 'Đã Thích' : 'Yêu Thích') + '</div>' +
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
    else if (state.prevScreen === 'home') showHome();
    else showBrowse();
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
  const epCols     = EP_COLS;
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
const BUFFER_PRESETS = {
  low:    { label: 'Thấp (tiết kiệm dữ liệu)', maxBufferLength: 20,  maxMaxBufferLength: 40,  maxBufferSize: 30  * 1000 * 1000, fragLoadingMaxRetry: 4,  manifestLoadingMaxRetry: 3, levelLoadingMaxRetry: 3 },
  normal: { label: 'Bình thường',              maxBufferLength: 60,  maxMaxBufferLength: 120, maxBufferSize: 90  * 1000 * 1000, fragLoadingMaxRetry: 8,  manifestLoadingMaxRetry: 6, levelLoadingMaxRetry: 6 },
  high:   { label: 'Cao (mạng yếu/chập chờn)',  maxBufferLength: 120, maxMaxBufferLength: 240, maxBufferSize: 180 * 1000 * 1000, fragLoadingMaxRetry: 10, manifestLoadingMaxRetry: 8, levelLoadingMaxRetry: 8 },
};
const BUFFER_LEVEL_ORDER = ['low', 'normal', 'high'];

function getBufferLevel() {
  try {
    const v = localStorage.getItem('tizenphim_bufferLevel');
    if (v && BUFFER_PRESETS[v]) return v;
  } catch (_) {}
  return 'normal';
}

function setBufferLevel(level) {
  try { localStorage.setItem('tizenphim_bufferLevel', level); } catch (_) {}
}

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
  const titleEl = document.getElementById('player-title');
  if (titleEl) titleEl.textContent = ((m && m.name) || '') + (isMovie ? '' : ' — ' + ep.name);
  const seekFillEl   = document.getElementById('seek-fill');
  const seekHandleEl = document.getElementById('seek-handle');
  const timeEl        = document.getElementById('player-time');
  if (seekFillEl)   seekFillEl.style.width  = '0%';
  if (seekHandleEl) seekHandleEl.style.left = '0%';
  if (timeEl) timeEl.textContent = '0:00 / 0:00';
  setPlayPauseIcon(true);
  const nextEpBtn = document.getElementById('player-next-ep');
  if (nextEpBtn) nextEpBtn.classList.toggle('hidden', epIdx >= eps.length - 1);
  const endHintEl = document.getElementById('player-end-hint');
  if (endHintEl) endHintEl.classList.add('hidden');
  showBuffering(false);
  state.playerZone         = 'controls';
  state.playerControlIndex = 1;
  renderPlayerFocus();
  showOverlayPersistent();

  startPlayback(url, resumeTime);
}

function showBuffering(show) {
  const el = document.getElementById('player-buffering');
  if (el) el.classList.toggle('hidden', !show);
}

function showEndOfContent() {
  showOverlayPersistent();
  const endHintEl = document.getElementById('player-end-hint');
  if (endHintEl) endHintEl.classList.remove('hidden');
}

function handleVideoEnded() {
  const eps  = currentEps();
  const next = state.currentEpIdx + 1;
  if (next < eps.length) playNext();
  else showEndOfContent();
}

function setPlayPauseIcon(isPlaying) {
  const btn = document.getElementById('player-playpause');
  if (btn) btn.innerHTML = isPlaying ? '&#10074;&#10074;' : '&#9654;';
}

function togglePlayPause() {
  mediaToggle();
}

function getPlayerControlIds() {
  const ids = ['player-rew', 'player-playpause', 'player-ff', 'player-settings', 'player-bug'];
  const nextBtn = document.getElementById('player-next-ep');
  if (nextBtn && !nextBtn.classList.contains('hidden')) ids.push('player-next-ep');
  return ids;
}

function movePlayerControlFocus(delta) {
  const ids = getPlayerControlIds();
  const max = ids.length - 1;
  state.playerControlIndex = Math.max(0, Math.min(max, state.playerControlIndex + delta));
  renderPlayerFocus();
}

function activateFocusedPlayerControl(video) {
  const ids = getPlayerControlIds();
  const id  = ids[state.playerControlIndex];
  if (id === 'player-rew') {
    mediaSeekBy(-10);
  } else if (id === 'player-playpause') {
    togglePlayPause();
  } else if (id === 'player-ff') {
    mediaSeekBy(10);
  } else if (id === 'player-settings') {
    openPlayerSettings();
  } else if (id === 'player-bug') {
    openDebugPanel();
  } else if (id === 'player-next-ep') {
    playNext();
  }
}

function renderPlayerFocus() {
  const seekBarEl = document.querySelector('.seek-bar');
  if (seekBarEl) seekBarEl.classList.toggle('focused', state.playerZone === 'seek');

  ['player-rew', 'player-playpause', 'player-ff', 'player-settings', 'player-bug', 'player-next-ep'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('focused');
  });
  if (state.playerZone === 'controls') {
    const ids = getPlayerControlIds();
    const activeId = ids[state.playerControlIndex];
    const el = activeId && document.getElementById(activeId);
    if (el) el.classList.add('focused');
  }
}

function openPlayerSettings() {
  const idx = BUFFER_LEVEL_ORDER.indexOf(getBufferLevel());
  state.playerSettingsFocus = idx >= 0 ? idx : 1;
  state.playerSettingsOpen  = true;
  renderPlayerSettings();
}

function closePlayerSettings() {
  state.playerSettingsOpen = false;
  const overlay = document.getElementById('player-settings-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function renderPlayerSettings() {
  const overlay = document.getElementById('player-settings-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  const current = getBufferLevel();
  overlay.innerHTML =
    '<div class="settings-box">' +
      '<div class="settings-title">Bộ đệm (Buffer)</div>' +
      BUFFER_LEVEL_ORDER.map(function(level, i) {
        const preset = BUFFER_PRESETS[level];
        return '<div class="settings-option' +
          (i === state.playerSettingsFocus ? ' focused' : '') +
          (level === current ? ' active' : '') + '">' +
          '<span>' + escHtml(preset.label) + '</span>' +
          '<span class="settings-option-check">&#10003;</span>' +
          '</div>';
      }).join('') +
    '</div>';
}

function handlePlayerSettings(k) {
  if (k === KEY.BACK || k === KEY.ESC || k === KEY.BACKSPACE) {
    closePlayerSettings();
    return true;
  }
  if (k === KEY.UP) {
    state.playerSettingsFocus = Math.max(0, state.playerSettingsFocus - 1);
    renderPlayerSettings();
    return true;
  }
  if (k === KEY.DOWN) {
    state.playerSettingsFocus = Math.min(BUFFER_LEVEL_ORDER.length - 1, state.playerSettingsFocus + 1);
    renderPlayerSettings();
    return true;
  }
  if (k === KEY.ENTER) {
    const level = BUFFER_LEVEL_ORDER[state.playerSettingsFocus];
    if (level) applyBufferLevelLive(level);
    closePlayerSettings();
    return true;
  }
  return false;
}

const MEDIA_ERROR_LABELS = {
  1: 'MEDIA_ERR_ABORTED (bị hủy)',
  2: 'MEDIA_ERR_NETWORK (lỗi mạng)',
  3: 'MEDIA_ERR_DECODE (lỗi giải mã)',
  4: 'MEDIA_ERR_SRC_NOT_SUPPORTED (định dạng/nguồn không hỗ trợ)',
};

function showPlayerError(msg) {
  const el = document.getElementById('player-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  console.error('[TizenPhim player]', msg);
}

function hidePlayerError() {
  const el = document.getElementById('player-error');
  if (el) el.classList.add('hidden');
}

// ── Media backend: native AVPlay on the TV, HTML5 + hls.js everywhere else ────
// AVPlay hands the whole HLS stream to the TV's hardware pipeline (no JS remux
// of MPEG-TS, no JS-heap buffer growth), so it stays smooth on long movies. If
// AVPlay errors on a stream (e.g. rejects #EXT-X-DISCONTINUITY), we fall back to
// the hls.js path automatically, once per playback session.
const AVPLAY = (typeof window !== 'undefined' && window.webapis && window.webapis.avplay) ? window.webapis.avplay : null;
let _mediaBackend = null;   // 'avplay' | 'html5'
let _avDuration = 0;        // seconds
let _avFellBack = false;

function showAvSurface(on) {
  const obj = document.getElementById('av-player');
  if (obj) obj.classList.toggle('hidden', !on);
  document.body.classList.toggle('avplay-active', !!on);
}

// Full diagnostics panel — press the 🐞 button, screenshot it, send to dev.
function openDebugPanel() {
  const url = state.currentStreamUrl || '';
  let cdn = '—'; try { if (url) cdn = new URL(url).hostname; } catch (_) {}
  let avState = '—'; if (AVPLAY) { try { avState = AVPLAY.getState(); } catch (e) { avState = 'err:' + e; } }
  const lines = [];
  lines.push('TizenPhim v' + VERSION);
  lines.push('Engine now:  ' + (_mediaBackend === 'avplay' ? 'AVPlay (native)' : _mediaBackend === 'html5' ? 'HLS.js (JS)' : '—'));
  lines.push('AVPlay API:  ' + (AVPLAY ? 'present' : 'ABSENT') + '   state: ' + avState);
  lines.push('Fell back:   ' + (_avFellBack ? 'YES → HLS.js' : 'no'));
  if (_lastAvReason) lines.push('AV reason:   ' + _lastAvReason);
  lines.push('');
  lines.push('Stream: ' + (url ? url.slice(0, 90) : '—'));
  lines.push('CDN:    ' + cdn);
  lines.push('Time:   ' + mediaTimeSec().toFixed(1) + ' / ' + mediaDurationSec().toFixed(0) + ' s');
  lines.push('Buffer preset: ' + getBufferLevel());
  if (_mediaBackend === 'html5') {
    const v = document.getElementById('video');
    let fwd = 0; try { fwd = v.buffered.length ? (v.buffered.end(v.buffered.length - 1) - v.currentTime) : 0; } catch (_) {}
    lines.push('HLS level:   ' + (_hls ? _hls.currentLevel : '—') + ' / ' + (_hls && _hls.levels ? _hls.levels.length : '—'));
    lines.push('Video state: readyState ' + (v ? v.readyState : '—') + ', err ' + (v && v.error ? v.error.code : 'none'));
    lines.push('Fwd buffer:  ' + fwd.toFixed(1) + 's');
  }
  lines.push('');
  lines.push('Screen: ' + window.innerWidth + 'x' + window.innerHeight);
  lines.push('UA: ' + (navigator.userAgent || '').slice(0, 130));

  const overlay = document.getElementById('debug-overlay');
  if (!overlay) return;
  overlay.innerHTML =
    '<div class="debug-box">' +
      '<div class="debug-title">🐞 Debug — chụp màn hình gửi dev</div>' +
      '<pre class="debug-pre">' + escHtml(lines.join('\n')) + '</pre>' +
      '<div class="debug-hint">Nhấn phím bất kỳ để đóng</div>' +
    '</div>';
  overlay.classList.remove('hidden');
  state.debugOpen = true;
}

function closeDebugPanel() {
  state.debugOpen = false;
  const overlay = document.getElementById('debug-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function mediaTimeSec() {
  if (_mediaBackend === 'avplay') { try { return (AVPLAY.getCurrentTime() || 0) / 1000; } catch (_) { return 0; } }
  const v = document.getElementById('video'); return v ? (v.currentTime || 0) : 0;
}
function mediaDurationSec() {
  if (_mediaBackend === 'avplay') return _avDuration || 0;
  const v = document.getElementById('video'); return (v && v.duration) ? v.duration : 0;
}
function mediaPaused() {
  if (_mediaBackend === 'avplay') { try { return AVPLAY.getState() === 'PAUSED'; } catch (_) { return false; } }
  const v = document.getElementById('video'); return v ? v.paused : true;
}
function mediaPlay() {
  if (_mediaBackend === 'avplay') { try { AVPLAY.play(); } catch (_) {} setPlayPauseIcon(true); return; }
  const v = document.getElementById('video'); if (v) v.play().catch(function () {}); setPlayPauseIcon(true);
}
function mediaPause() {
  if (_mediaBackend === 'avplay') { try { AVPLAY.pause(); } catch (_) {} setPlayPauseIcon(false); return; }
  const v = document.getElementById('video'); if (v) v.pause(); setPlayPauseIcon(false);
}
function mediaToggle() { if (mediaPaused()) mediaPlay(); else mediaPause(); }
function mediaSeekBy(sec) {
  if (_mediaBackend === 'avplay') {
    try { if (sec >= 0) AVPLAY.jumpForward(Math.round(sec * 1000)); else AVPLAY.jumpBackward(Math.round(-sec * 1000)); } catch (_) {}
    updatePlayerBar(); return;
  }
  const v = document.getElementById('video');
  if (v) { v.currentTime = Math.max(0, (v.currentTime || 0) + sec); updatePlayerBar(); }
}

function avCleanup() {
  clearAvHealthWatch();
  try { AVPLAY.stop(); } catch (_) {}
  try { AVPLAY.close(); } catch (_) {}
}

// Health watchdog: AVPlay can report success yet render nothing (black screen,
// no error) if the display surface or codec path is wrong. If playback time
// doesn't advance within ~10s (while not paused), treat it as a failure and
// fall back to hls.js — so the worst on-TV case is "plays via hls.js", never a
// dead screen.
let _avHealthTimer = null;
function clearAvHealthWatch() { if (_avHealthTimer) { clearInterval(_avHealthTimer); _avHealthTimer = null; } }
function startAvHealthWatch(url, resumeTime) {
  clearAvHealthWatch();
  let startAt = 0; try { startAt = (AVPLAY.getCurrentTime() || 0) / 1000; } catch (_) {}
  let ticks = 0;
  _avHealthTimer = setInterval(function () {
    let paused = false; try { paused = AVPLAY.getState() === 'PAUSED'; } catch (_) {}
    if (paused) return;                       // user paused — not a stall
    let t = 0; try { t = (AVPLAY.getCurrentTime() || 0) / 1000; } catch (_) {}
    if (t > startAt + 0.5) { clearAvHealthWatch(); return; }   // progressing → healthy
    if (++ticks >= 5) {                        // ~10s, no progress
      clearAvHealthWatch();
      avFail(url, resumeTime, 'no playback progress (black screen?)');
    }
  }, 2000);
}

let _lastAvReason = '';
function avFail(url, resumeTime, why) {
  clearAvHealthWatch();
  _lastAvReason = why;
  if (_avFellBack) { showPlayerError('Lỗi phát (AVPlay): ' + why); return; }
  _avFellBack = true;
  let at = resumeTime || 0;
  try { const t = (AVPLAY.getCurrentTime() || 0) / 1000; if (t > 1) at = t; } catch (_) {}
  avCleanup();
  showAvSurface(false);
  startPlaybackHtml5(url, at);
}

function startPlaybackAV(url, resumeTime) {
  try {
    _mediaBackend = null;
    showAvSurface(true);
    AVPLAY.open(url);
    AVPLAY.setDisplayRect(0, 0, 1920, 1080);
    try { AVPLAY.setStreamingProperty('ADAPTIVE_INFO', 'STARTBITRATE=HIGHEST|SKIPBITRATE=LOWEST'); } catch (_) {}
    AVPLAY.setListener({
      onbufferingstart:     function () { showBuffering(true); },
      onbufferingprogress:  function () {},
      onbufferingcomplete:  function () { showBuffering(false); },
      oncurrentplaytime:    function () { updatePlayerBar(); },
      onstreamcompleted:    function () { showBuffering(false); handleVideoEnded(); },
      onevent:              function () {},
      onerror:              function (e) { avFail(url, resumeTime, String(e)); },
      onerrormsg:           function (e, msg) { avFail(url, resumeTime, msg || String(e)); },
      onresourceconflicted: function () { avFail(url, resumeTime, 'resource conflicted'); },
    });
    AVPLAY.prepareAsync(function () {
      _mediaBackend = 'avplay';
      try { _avDuration = (AVPLAY.getDuration() || 0) / 1000; } catch (_) { _avDuration = 0; }
      if (resumeTime && resumeTime > 5) { try { AVPLAY.seekTo(Math.round(resumeTime * 1000)); } catch (_) {} }
      try { AVPLAY.play(); } catch (_) {}
      setPlayPauseIcon(true);
      showBuffering(false);
      startAvHealthWatch(url, resumeTime);
    }, function (err) { avFail(url, resumeTime, 'prepare: ' + err); });
  } catch (e) {
    avFail(url, resumeTime, 'open: ' + (e && e.message ? e.message : String(e)));
  }
}

function startPlayback(url, resumeTime) {
  clearTimeout(_stallTimer);
  clearAvHealthWatch();
  state.currentStreamUrl = url;
  hidePlayerError();
  _mediaBackend = null;
  _avFellBack = false;
  _avDuration = 0;
  if (AVPLAY) startPlaybackAV(url, resumeTime);
  else startPlaybackHtml5(url, resumeTime);
}

function startPlaybackHtml5(url, resumeTime) {
  const video = document.getElementById('video');
  if (!video) return;
  _mediaBackend = 'html5';
  showAvSurface(false);

  if (_hls) { _hls.destroy(); _hls = null; }
  state.currentStreamUrl = url;
  hidePlayerError();

  video.ontimeupdate = updatePlayerBar;
  video.onended      = handleVideoEnded;
  video.onloadedmetadata = function() {
    if (resumeTime && resumeTime > 5 && video.duration && resumeTime < video.duration - 2) {
      try { video.currentTime = resumeTime; } catch (_) {}
    }
  };
  // Stall watchdog: a long seek into an unbuffered region can leave hls.js
  // buffering forever. If we're still waiting after 10s (and not paused), force
  // a reload from the current position. onseeked clears a stuck overlay too.
  clearTimeout(_stallTimer);
  video.onwaiting = function() {
    showBuffering(true);
    clearTimeout(_stallTimer);
    _stallTimer = setTimeout(function() {
      if (_hls && !video.paused) { try { _hls.startLoad(); } catch (_) {} }
    }, 10000);
  };
  video.onplaying = function() { showBuffering(false); hidePlayerError(); clearTimeout(_stallTimer); };
  video.oncanplay = function() { showBuffering(false); clearTimeout(_stallTimer); };
  video.onseeked  = function() { showBuffering(false); };
  video.onerror   = function() {
    const code = video.error && video.error.code;
    showPlayerError('Không phát được video (' + (MEDIA_ERROR_LABELS[code] || 'lỗi không rõ #' + code) + ')');
  };

  const preset = BUFFER_PRESETS[getBufferLevel()] || BUFFER_PRESETS.normal;

  function attemptPlay() {
    video.play().catch(function(err) {
      showPlayerError('Không thể tự phát: ' + (err && err.message ? err.message : String(err)));
    });
  }

  // These streams' manifests are full of #EXT-X-DISCONTINUITY (spliced/re-encoded
  // segments), which native HLS decoders (Safari/AVFoundation, Tizen's AVPlay)
  // reject outright even when canPlayType() claims support. hls.js's software
  // remuxer tolerates it, so it's used everywhere — not just on Tizen.
  if (window.Hls && window.Hls.isSupported()) {
    _hls = new window.Hls({
      // Cap the already-played (back) buffer. Its default is unbounded, so a
      // 2h movie at 3.5Mbps accumulates a huge in-memory buffer that exhausts a
      // low-RAM Tizen TV and causes constant rebuffering (short anime episodes
      // never hit this — which is why TizenAnime seemed fine).
      backBufferLength: 30,
      maxBufferLength: preset.maxBufferLength,
      maxMaxBufferLength: preset.maxMaxBufferLength,
      maxBufferSize: preset.maxBufferSize,
      fragLoadingMaxRetry: preset.fragLoadingMaxRetry,
      fragLoadingRetryDelay: 1000,
      manifestLoadingMaxRetry: preset.manifestLoadingMaxRetry,
      levelLoadingMaxRetry: preset.levelLoadingMaxRetry,
    });
    _hls.loadSource(url);
    _hls.attachMedia(video);
    _hls.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
    _hls.on(window.Hls.Events.ERROR, function(_evt, data) {
      if (!data || !data.fatal) return;
      showPlayerError('Lỗi phát HLS (' + data.type + '): ' + (data.details || 'không rõ'));
    });
  } else {
    video.src = url;
    attemptPlay();
  }
  showOverlay();
}

function applyBufferLevelLive(level) {
  setBufferLevel(level);
  const video = document.getElementById('video');
  if (!video || !_hls || !state.currentStreamUrl) return;
  const resumeAt = video.currentTime || 0;
  const wasPaused = video.paused;
  startPlaybackHtml5(state.currentStreamUrl, resumeAt);
  if (wasPaused) {
    setTimeout(function() { const v = document.getElementById('video'); if (v) { v.pause(); setPlayPauseIcon(false); } }, 300);
  }
}

function stopPlayback() {
  clearTimeout(_stallTimer);
  clearAvHealthWatch();
  const dur = mediaDurationSec();
  if (dur && state.currentSlug) {
    saveHistory(state.currentSlug, { epIdx: state.currentEpIdx, time: mediaTimeSec(), duration: dur });
    syncLocalRow('continue');
  }
  if (_mediaBackend === 'avplay') { avCleanup(); showAvSurface(false); }
  const video = document.getElementById('video');
  if (video) {
    video.src = ''; video.ontimeupdate = null; video.onended = null; video.onloadedmetadata = null;
    video.onwaiting = null; video.onplaying = null; video.oncanplay = null; video.onseeked = null;
  }
  if (_hls) { _hls.destroy(); _hls = null; }
  _mediaBackend = null;
  showBuffering(false);
  closePlayerSettings();
  clearTimeout(state.overlayTimer);
}

function playNext() {
  const eps = currentEps();
  const next = state.currentEpIdx + 1;
  if (next < eps.length) playEpisode(next);
}

function updatePlayerBar() {
  const cur = mediaTimeSec(), dur = mediaDurationSec();
  if (!dur) return;
  const fmt = function(t) {
    t = Math.max(0, Math.floor(t));
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    const mm = h ? String(m).padStart(2, '0') : String(m);
    return (h ? h + ':' : '') + mm + ':' + String(s).padStart(2, '0');
  };
  const pct = (cur / dur) * 100;
  const timeEl       = document.getElementById('player-time');
  const seekFillEl   = document.getElementById('seek-fill');
  const seekHandleEl = document.getElementById('seek-handle');
  if (timeEl)       timeEl.textContent   = fmt(cur) + ' / ' + fmt(dur);
  if (seekFillEl)   seekFillEl.style.width  = pct + '%';
  if (seekHandleEl) seekHandleEl.style.left = pct + '%';
  const now = Date.now();
  if (now - _lastProgressSave > 5000) {
    _lastProgressSave = now;
    saveHistory(state.currentSlug, { epIdx: state.currentEpIdx, time: cur, duration: dur });
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

  // Dedicated hardware transport buttons always work, regardless of focus zone.
  if (k === KEY.PLAY || k === KEY.PAUSE || k === KEY.PLAYPAUSE) {
    togglePlayPause();
    return true;
  }
  if (k === KEY.FF) {
    mediaSeekBy(10);
    return true;
  }
  if (k === KEY.REW) {
    mediaSeekBy(-10);
    return true;
  }

  const inSeekZone = state.playerZone === 'seek';

  if (k === KEY.LEFT) {
    if (inSeekZone) mediaSeekBy(-10);
    else movePlayerControlFocus(-1);
    return true;
  }
  if (k === KEY.RIGHT) {
    if (inSeekZone) mediaSeekBy(10);
    else movePlayerControlFocus(1);
    return true;
  }
  if (k === KEY.UP) {
    if (!inSeekZone) { state.playerZone = 'seek'; renderPlayerFocus(); }
    return true;
  }
  if (k === KEY.DOWN) {
    if (inSeekZone) { state.playerZone = 'controls'; renderPlayerFocus(); }
    return true;
  }
  if (k === KEY.ENTER) {
    if (inSeekZone) togglePlayPause();
    else activateFocusedPlayerControl(video);
    return true;
  }

  return false;
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
    if (f[slug]) {
      delete f[slug];
      localStorage.setItem('tizenphim_favorites', JSON.stringify(f));
      syncLocalRow('favorite');
      return false;
    }
    f[slug] = { slug: slug, name: name, poster: poster, ts: Date.now() };
    localStorage.setItem('tizenphim_favorites', JSON.stringify(f));
    syncLocalRow('favorite');
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
