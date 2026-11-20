// GTA 6 trophy guide and tracker: loads the local trophy data, renders the
// checklist, roadmap and per-trophy guides, and saves progress in localStorage.
// No network at runtime: the only fetch is the app's own data/trophies.json.

const DATA_URL = 'data/trophies.json';
const PROGRESS_KEY = 'gta6-trophy-progress-v1';
const SPOILER_KEY = 'gta6-trophy-spoiler-v1';

const FILTERS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online', 'earned', 'remaining'];

let trophies = [];
let earned = new Set();
let spoiler = false;
let currentFilter = 'all';
let currentGrade = 'all';
let currentSearch = '';
let openGuideId = null;

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const emptyEl = $('emptyState');

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.earned)) earned = new Set(parsed.earned.filter((n) => Number.isInteger(n)));
  } catch { /* corrupted save: start fresh */ }
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), savedAt: new Date().toISOString() }));
  } catch { /* storage unavailable: progress stays in memory */ }
}

function loadSpoiler() {
  spoiler = localStorage.getItem(SPOILER_KEY) === '1';
  $('spoilerToggle').checked = spoiler;
}

function saveSpoiler() {
  try { localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0'); } catch { /* ignore */ }
}

function isStoryHidden(trophy) {
  return spoiler && trophy.kind === 'story' && !earned.has(trophy.id);
}

function trophyMatches(trophy) {
  if (currentGrade !== 'all' && trophy.grade !== currentGrade) return false;
  if (currentSearch) {
    const hay = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
    if (!hay.includes(currentSearch.toLowerCase())) return false;
  }
  switch (currentFilter) {
    case 'story': return trophy.kind === 'story';
    case 'missable': return trophy.missable === true;
    case 'collectibles': return trophy.kind === 'collectibles';
    case 'activities': return trophy.kind === 'activities';
    case 'online': return trophy.kind === 'online';
    case 'earned': return earned.has(trophy.id);
    case 'remaining': return !earned.has(trophy.id);
    default: return true;
  }
}

function renderProgress() {
  const count = earned.size;
  const total = trophies.length;
  $('progressText').textContent = count + ' of ' + total + ' earned';
  $('progressPct').textContent = total ? Math.round((count / total) * 100) + '%' : '0%';
  $('progressFill').style.width = total ? (count / total) * 100 + '%' : '0%';
  $('progressNote').textContent = count === total && total > 0
    ? 'Platinum earned — you are a Leonida Legend.'
    : 'Tick a trophy when you earn it. Progress is saved in this browser.';
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = 'badge ' + cls;
  span.textContent = text;
  return span;
}

function sourceList(trophy) {
  const ul = document.createElement('ul');
  ul.className = 'guide-sources';
  for (const source of trophy.sources || []) {
    const li = document.createElement('li');
    li.textContent = source.url ? source.name + ' — ' + source.url : source.name;
    ul.appendChild(li);
  }
  return ul;
}

function guideBody(trophy) {
  const div = document.createElement('div');
  div.className = 'guide-body';
  const p = document.createElement('p');
  p.textContent = trophy.guide;
  div.appendChild(p);
  const label = document.createElement('p');
  label.textContent = 'Sources:';
  div.appendChild(label);
  div.appendChild(sourceList(trophy));
  return div;
}

function renderTrophyRow(trophy) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(trophy.id) ? ' earned' : '');
  li.id = 'trophy-' + trophy.id;

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = earned.has(trophy.id);
  check.setAttribute('aria-label', 'Mark trophy ' + trophy.id + ' as earned');
  check.addEventListener('change', () => {
    if (check.checked) earned.add(trophy.id); else earned.delete(trophy.id);
    saveProgress();
    renderAll();
  });
  li.appendChild(check);

  const body = document.createElement('div');
  const name = document.createElement('h3');
  name.className = 'trophy-name';
  const num = document.createElement('span');
  num.className = 'num';
  num.textContent = '#' + trophy.id;
  name.appendChild(num);
  name.appendChild(document.createTextNode(isStoryHidden(trophy) ? 'Hidden story trophy — earn it to reveal' : trophy.name));
  body.appendChild(name);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isStoryHidden(trophy)
    ? 'Hidden until earned (spoiler mode is on).'
    : trophy.description;
  body.appendChild(desc);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.appendChild(badge(trophy.grade, trophy.grade));
  meta.appendChild(badge(trophy.kind, 'kind'));
  if (trophy.hidden) meta.appendChild(badge('Hidden on PS', 'hidden-flag'));
  if (trophy.missable) meta.appendChild(badge('Possibly missable', 'missable'));
  if (trophy.countLabel) meta.appendChild(badge(trophy.countLabel, 'count'));
  body.appendChild(meta);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  const open = openGuideId === trophy.id;
  toggle.textContent = open ? 'Hide guide ▲' : 'Show guide ▼';
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.addEventListener('click', () => {
    openGuideId = open ? null : trophy.id;
    renderList();
    const target = document.getElementById('trophy-' + trophy.id);
    if (target) target.scrollIntoView({ block: 'nearest' });
  });
  body.appendChild(toggle);
  if (open) body.appendChild(guideBody(trophy));
  li.appendChild(body);

  const gradeCell = document.createElement('div');
  gradeCell.className = 'trophy-grade';
  gradeCell.appendChild(badge(trophy.grade, trophy.grade));
  li.appendChild(gradeCell);
  return li;
}

function renderList() {
  listEl.innerHTML = '';
  const shown = trophies.filter(trophyMatches);
  if (currentFilter === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies: all 55 GTA 6 trophies are single-player. There is no online multiplayer trophy to track — play the story and the single-player activities and you can earn them all offline.';
  } else if (shown.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match this filter. Try another filter or clear the search.';
  } else {
    emptyEl.hidden = true;
  }
  for (const trophy of shown) listEl.appendChild(renderTrophyRow(trophy));
  $('listCount').textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies.';
}

function renderRoadmapStages() {
  for (const stage of [1, 2, 3]) {
    const el = $('stage' + stage + 'List');
    if (!el) continue;
    const names = trophies.filter((t) => t.stage === stage).map((t) => '#' + t.id + ' ' + t.name);
    el.textContent = 'Trophies: ' + names.join(' · ');
  }
}

function renderDetail() {
  const panel = $('detailPanel');
  const match = location.hash.match(/^#\/trophy\/(\d+)$/);
  if (!match) { panel.hidden = true; panel.innerHTML = ''; return; }
  const trophy = trophies.find((t) => t.id === Number(match[1]));
  if (!trophy) { panel.hidden = true; panel.innerHTML = ''; return; }
  openGuideId = trophy.id;
  panel.innerHTML = '';
  panel.hidden = false;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'close-detail';
  close.textContent = 'Close ×';
  close.addEventListener('click', () => { location.hash = '#/'; });
  panel.appendChild(close);
  const title = document.createElement('h2');
  title.textContent = '#' + trophy.id + ' — ' + (isStoryHidden(trophy) ? 'Hidden story trophy' : trophy.name);
  panel.appendChild(title);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isStoryHidden(trophy) ? 'Hidden until earned (spoiler mode is on).' : trophy.description;
  panel.appendChild(desc);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.appendChild(badge(trophy.grade, trophy.grade));
  meta.appendChild(badge(trophy.kind, 'kind'));
  if (trophy.hidden) meta.appendChild(badge('Hidden on PS', 'hidden-flag'));
  if (trophy.missable) meta.appendChild(badge('Possibly missable — do the Chapter 1 meditation', 'missable'));
  if (trophy.countLabel) meta.appendChild(badge(trophy.countLabel, 'count'));
  panel.appendChild(meta);
  const earnedState = document.createElement('p');
  earnedState.textContent = earned.has(trophy.id) ? 'Earned ✓ — ticked in your checklist.' : 'Not earned yet — tick it in the checklist when you earn it.';
  panel.appendChild(earnedState);
  panel.appendChild(guideBody(trophy));
}

function applyHashRoute() {
  const hash = location.hash || '#/';
  const filterMatch = hash.match(/^#\/filter\/([a-z]+)$/);
  const roadmap = hash === '#/roadmap';
  $('roadmapView').hidden = !roadmap;
  $('checklistView').hidden = roadmap;
  $('tabRoadmap').classList.toggle('active', roadmap);
  $('tabChecklist').classList.toggle('active', !roadmap && !filterMatch);
  $('tabMissable').classList.toggle('active', filterMatch !== null && filterMatch[1] === 'missable');
  if (filterMatch && FILTERS.includes(filterMatch[1])) currentFilter = filterMatch[1];
  if (hash === '#/' ) currentFilter = 'all';
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.filter === currentFilter);
  });
  renderDetail();
  renderList();
}

function renderAll() {
  renderProgress();
  renderRoadmapStages();
  $('spoilerNote').hidden = !spoiler;
  applyHashRoute();
}

function exportProgress() {
  const data = JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('bad file');
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(ids.filter((n) => Number.isInteger(n) && valid.has(n)));
      saveProgress();
      renderAll();
    } catch {
      alert('That file is not a valid progress export.');
    }
  };
  reader.readAsText(file);
}

async function init() {
  loadProgress();
  loadSpoiler();
  const response = await fetch(DATA_URL);
  const data = await response.json();
  trophies = Array.isArray(data) ? data : data.trophies;
  trophies.sort((a, b) => a.id - b.id);

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      currentFilter = chip.dataset.filter;
      location.hash = currentFilter === 'all' ? '#/' : '#/filter/' + currentFilter;
      applyHashRoute();
    });
  });
  $('gradeFilter').addEventListener('change', (event) => {
    currentGrade = event.target.value;
    renderList();
  });
  $('search').addEventListener('input', (event) => {
    currentSearch = event.target.value;
    renderList();
  });
  $('spoilerToggle').addEventListener('change', (event) => {
    spoiler = event.target.checked;
    saveSpoiler();
    renderAll();
  });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importFile').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies?')) {
      earned = new Set();
      saveProgress();
      renderAll();
    }
  });
  window.addEventListener('hashchange', applyHashRoute);

  renderAll();
}

init();
