'use strict';
/* =========================================================
   Life Dashboard — app.js
   Satu file JS: semua modul (Storage, ThemeToggle, Clock,
   TaskList, FocusTimer, QuickLinks) + init utama
   ========================================================= */

/* ---------------------------------------------------------
   1. Storage Module
   --------------------------------------------------------- */
var Storage = (function () {
  var KEYS = {
    tasks:  'ld:tasks',
    links:  'ld:links',
    config: 'ld:config'
  };

  var DEFAULT_CONFIG = {
    userName:       '',
    darkMode:       false,
    focusDuration:  25,
    breakDuration:  5
  };

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[Storage] save error:', e);
    }
  }

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      var parsed = JSON.parse(raw);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function loadConfig() {
    var stored = load(KEYS.config, {});
    return Object.assign({}, DEFAULT_CONFIG, stored);
  }

  function saveConfig(config) {
    save(KEYS.config, config);
  }

  return { save, load, remove, loadConfig, saveConfig, KEYS, DEFAULT_CONFIG };
})();


/* ---------------------------------------------------------
   2. ThemeToggle Module
   --------------------------------------------------------- */
var ThemeToggle = (function () {
  var current = 'light';

  function init() {
    var cfg = Storage.loadConfig();
    current = cfg.darkMode ? 'dark' : 'light';
    applyTheme(current);
    bindEvents();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var icon  = document.getElementById('theme-icon');
    var label = document.getElementById('theme-label');
    if (theme === 'dark') {
      if (icon)  icon.textContent  = '☀️';
      if (label) label.textContent = 'Light Mode';
    } else {
      if (icon)  icon.textContent  = '🌙';
      if (label) label.textContent = 'Dark Mode';
    }
    current = theme;
  }

  function toggle() {
    var newTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    var cfg = Storage.loadConfig();
    cfg.darkMode = (newTheme === 'dark');
    Storage.saveConfig(cfg);
    document.dispatchEvent(new CustomEvent('app:theme-changed', { detail: { theme: newTheme } }));
  }

  function getCurrent() {
    return current;
  }

  function bindEvents() {
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  return { init, toggle, getCurrent };
})();


/* ---------------------------------------------------------
   3. Clock Module
   --------------------------------------------------------- */
var Clock = (function () {
  var intervalId = null;
  var lastDay    = null;
  var lastHour   = null;

  var GREETINGS = [
    /* 00-04 */ 'Selamat Malam',
    /* 05-11 */ 'Selamat Pagi',
    /* 12-14 */ 'Selamat Siang',
    /* 15-17 */ 'Selamat Sore',
    /* 18-23 */ 'Selamat Malam'
  ];

  function getGreeting(hour) {
    if (hour >= 5  && hour <= 11) return 'Selamat Pagi';
    if (hour >= 12 && hour <= 14) return 'Selamat Siang';
    if (hour >= 15 && hour <= 17) return 'Selamat Sore';
    return 'Selamat Malam';
  }

  function formatGreeting(greeting, name) {
    var n = (name || '').trim();
    return n ? (greeting + ', ' + n + '!') : (greeting + '!');
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    var now  = new Date();
    var h    = now.getHours();
    var m    = now.getMinutes();
    var s    = now.getSeconds();

    // Update time
    var timeEl = document.getElementById('clock-time');
    if (timeEl) timeEl.textContent = pad2(h) + ':' + pad2(m) + ':' + pad2(s);

    // Update date when day changes
    var dayStr = now.toDateString();
    if (dayStr !== lastDay) {
      lastDay = dayStr;
      updateDate(now);
    }

    // Update greeting when time range changes
    if (h !== lastHour) {
      lastHour = h;
      updateGreeting();
    }
  }

  function updateDate(date) {
    var dateEl = document.getElementById('clock-date');
    if (!dateEl) return;
    try {
      var formatter = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      dateEl.textContent = formatter.format(date || new Date());
    } catch (e) {
      // Fallback manual
      var days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
      var months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
      var d = date || new Date();
      dateEl.textContent = days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }
  }

  function updateGreeting() {
    var greetingEl = document.getElementById('greeting');
    if (!greetingEl) return;
    var cfg  = Storage.loadConfig();
    var hour = new Date().getHours();
    greetingEl.textContent = formatGreeting(getGreeting(hour), cfg.userName);
  }

  function setUserName(name) {
    var trimmed = (name || '').trim();
    var cfg = Storage.loadConfig();
    cfg.userName = trimmed;
    Storage.saveConfig(cfg);
    renderUsernameUI(trimmed);
    updateGreeting();
    document.dispatchEvent(new CustomEvent('app:username-saved', { detail: { name: trimmed } }));
  }

  function clearUserName() {
    setUserName('');
  }

  function renderUsernameUI(name) {
    var display    = document.getElementById('username-display');
    var inputGroup = document.getElementById('username-input-group');
    var nameText   = document.getElementById('username-text');
    var nameInput  = document.getElementById('name-input');

    if (name) {
      if (display)    { display.style.display = 'flex'; }
      if (inputGroup) { inputGroup.style.display = 'none'; }
      if (nameText)   { nameText.textContent = '👤 ' + name; }
    } else {
      if (display)    { display.style.display = 'none'; }
      if (inputGroup) { inputGroup.style.display = 'flex'; }
      if (nameInput)  { nameInput.value = ''; }
    }
  }

  function bindEvents() {
    var saveBtn  = document.getElementById('save-name-btn');
    var editBtn  = document.getElementById('edit-name-btn');
    var clearBtn = document.getElementById('clear-name-btn');
    var nameInput = document.getElementById('name-input');

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var val = (nameInput ? nameInput.value : '').trim();
        if (val) setUserName(val);
      });
    }

    if (nameInput) {
      nameInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var val = nameInput.value.trim();
          if (val) setUserName(val);
        }
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', function () {
        var cfg = Storage.loadConfig();
        var display    = document.getElementById('username-display');
        var inputGroup = document.getElementById('username-input-group');
        var nameInput  = document.getElementById('name-input');
        if (display)    display.style.display = 'none';
        if (inputGroup) inputGroup.style.display = 'flex';
        if (nameInput)  { nameInput.value = cfg.userName; nameInput.focus(); }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', clearUserName);
    }
  }

  function init() {
    var cfg = Storage.loadConfig();

    // Force first tick immediately
    lastHour = -1; // ensure greeting is set on first tick
    tick();

    // Then update every second
    intervalId = setInterval(tick, 1000);

    // Render username UI
    renderUsernameUI(cfg.userName);
    bindEvents();
  }

  return { init, setUserName, clearUserName, getGreeting, formatGreeting };
})();


/* ---------------------------------------------------------
   4. TaskList Module
   --------------------------------------------------------- */
var TaskList = (function () {
  var tasks     = [];
  var sortOrder = 'created-newest';

  /* Helpers */
  function generateId() {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }
  }

  function validateTaskText(text, existingTasks, excludeId) {
    var trimmed = (text || '').trim();
    if (!trimmed) {
      return { valid: false, error: 'Deskripsi tugas tidak boleh kosong.' };
    }
    if (trimmed.length > 200) {
      return { valid: false, error: 'Deskripsi tugas maksimal 200 karakter.' };
    }
    var isDup = existingTasks.some(function (t) {
      return t.id !== excludeId && t.text.trim().toLowerCase() === trimmed.toLowerCase();
    });
    if (isDup) {
      return { valid: false, error: 'Tugas dengan deskripsi yang sama sudah ada.' };
    }
    return { valid: true, error: null };
  }

  /* Sort */
  function getSortedTasks() {
    var copy = tasks.slice();
    switch (sortOrder) {
      case 'created-oldest':
        copy.sort(function (a, b) { return a.createdAt - b.createdAt; });
        break;
      case 'incomplete-first':
        copy.sort(function (a, b) {
          if (a.done !== b.done) return a.done ? 1 : -1;
          return b.createdAt - a.createdAt;
        });
        break;
      case 'complete-first':
        copy.sort(function (a, b) {
          if (a.done !== b.done) return a.done ? -1 : 1;
          return b.createdAt - a.createdAt;
        });
        break;
      default: /* created-newest */
        copy.sort(function (a, b) { return b.createdAt - a.createdAt; });
    }
    return copy;
  }

  /* Render */
  function render() {
    var list     = document.getElementById('task-list');
    var emptyMsg = document.getElementById('task-empty');
    if (!list) return;

    list.innerHTML = '';
    var sorted = getSortedTasks();

    if (sorted.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    sorted.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.dataset.id = task.id;

      // Checkbox
      var cb = document.createElement('input');
      cb.type      = 'checkbox';
      cb.className = 'task-checkbox';
      cb.checked   = task.done;
      cb.setAttribute('aria-label', (task.done ? 'Tandai belum selesai: ' : 'Tandai selesai: ') + task.text);
      cb.addEventListener('change', function () { toggleTask(task.id); });

      // Text
      var span = document.createElement('span');
      span.className   = 'task-text';
      span.textContent = task.text;

      // Actions
      var actions = document.createElement('div');
      actions.className = 'task-actions';

      var editBtn = document.createElement('button');
      editBtn.className = 'btn btn-sm btn-secondary';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', 'Edit tugas: ' + task.text);
      editBtn.addEventListener('click', function () { startEdit(task.id, li, span); });

      var delBtn = document.createElement('button');
      delBtn.className = 'btn btn-sm btn-danger';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Hapus tugas: ' + task.text);
      delBtn.addEventListener('click', function () { deleteTask(task.id); });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  /* Edit inline */
  function startEdit(id, li, span) {
    // Remove any existing edit inputs
    var existing = li.querySelector('.task-edit-input');
    if (existing) return;

    var task = tasks.find(function (t) { return t.id === id; });
    if (!task) return;

    var input = document.createElement('input');
    input.type      = 'text';
    input.className = 'task-edit-input';
    input.value     = task.text;
    input.maxLength = 200;

    var saveBtn = document.createElement('button');
    saveBtn.className   = 'btn btn-sm btn-primary';
    saveBtn.textContent = '✓';
    saveBtn.setAttribute('aria-label', 'Simpan perubahan tugas');

    var cancelBtn = document.createElement('button');
    cancelBtn.className   = 'btn btn-sm btn-secondary';
    cancelBtn.textContent = '✕';
    cancelBtn.setAttribute('aria-label', 'Batal edit tugas');

    // Error element
    var errDiv = document.createElement('div');
    errDiv.className = 'task-edit-error';

    // Hide text span and edit/del buttons, show edit input
    span.style.display = 'none';
    var actionsDiv = li.querySelector('.task-actions');
    if (actionsDiv) actionsDiv.style.display = 'none';

    li.insertBefore(input, actionsDiv || null);
    li.insertBefore(saveBtn, actionsDiv || null);
    li.insertBefore(cancelBtn, actionsDiv || null);
    li.parentNode.insertBefore(errDiv, li.nextSibling);

    input.focus();
    input.select();

    function doSave() {
      var res = editTask(id, input.value);
      if (!res.valid) {
        errDiv.textContent = res.error;
        return;
      }
      cleanup();
    }

    function doCancel() {
      cleanup();
      render();
    }

    function cleanup() {
      if (errDiv.parentNode) errDiv.parentNode.removeChild(errDiv);
    }

    saveBtn.addEventListener('click', doSave);
    cancelBtn.addEventListener('click', doCancel);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doSave();
      if (e.key === 'Escape') doCancel();
    });
  }

  /* CRUD */
  function addTask(text) {
    var res = validateTaskText(text, tasks, null);
    var errEl = document.getElementById('task-error');
    if (!res.valid) {
      if (errEl) errEl.textContent = res.error;
      return false;
    }
    if (errEl) errEl.textContent = '';
    tasks.push({ id: generateId(), text: text.trim(), done: false, createdAt: Date.now() });
    saveTasks();
    render();
    return true;
  }

  function toggleTask(id) {
    var task = tasks.find(function (t) { return t.id === id; });
    if (task) { task.done = !task.done; saveTasks(); render(); }
  }

  function editTask(id, newText) {
    var res = validateTaskText(newText, tasks, id);
    if (!res.valid) return res;
    var task = tasks.find(function (t) { return t.id === id; });
    if (task) { task.text = newText.trim(); saveTasks(); render(); }
    return { valid: true, error: null };
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks();
    render();
  }

  function sortBy(order) {
    sortOrder = order;
    render();
  }

  function saveTasks() {
    Storage.save(Storage.KEYS.tasks, tasks);
  }

  function init() {
    tasks = Storage.load(Storage.KEYS.tasks, []);

    // Add task form
    var form  = document.getElementById('task-form');
    var input = document.getElementById('task-input');
    var errEl = document.getElementById('task-error');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = input ? input.value : '';
        if (addTask(text)) {
          if (input) input.value = '';
        }
      });
    }

    if (input && errEl) {
      input.addEventListener('input', function () { errEl.textContent = ''; });
    }

    // Sort select
    var sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () { sortBy(sortSelect.value); });
    }

    render();
  }

  return { init, addTask, toggleTask, editTask, deleteTask, sortBy };
})();


/* ---------------------------------------------------------
   5. FocusTimer Module
   --------------------------------------------------------- */
var FocusTimer = (function () {
  var state = {
    mode:          'focus',
    status:        'idle',
    remaining:     25 * 60,
    focusDuration: 25,
    breakDuration: 5
  };

  var intervalId = null;

  /* Helpers */
  function pad2(n) { return String(n).padStart(2, '0'); }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return pad2(m) + ':' + pad2(s);
  }

  function validateDuration(value, min, max) {
    var n = parseInt(value, 10);
    if (isNaN(n) || String(parseInt(value, 10)) !== String(value).trim()) {
      return { valid: false, error: 'Masukkan bilangan bulat yang valid.' };
    }
    if (n < min || n > max) {
      return { valid: false, error: 'Durasi harus antara ' + min + ' hingga ' + max + ' menit.' };
    }
    return { valid: true, value: n };
  }

  /* Render */
  function render() {
    var display     = document.getElementById('timer-display');
    var modeLabel   = document.getElementById('timer-mode-label');
    var statusLabel = document.getElementById('timer-status-label');
    var startBtn    = document.getElementById('timer-start');
    var pauseBtn    = document.getElementById('timer-pause');
    var focusInput  = document.getElementById('focus-duration-input');
    var breakInput  = document.getElementById('break-duration-input');
    var durControls = document.getElementById('timer-duration-controls');

    if (display) {
      display.textContent = formatTime(state.remaining);
      display.className = 'timer-display';
      if (state.status === 'running') display.classList.add('running');
      if (state.mode === 'break')     display.classList.add('break-mode');
    }

    if (modeLabel) {
      modeLabel.textContent = state.mode === 'focus' ? 'Focus' : 'Break';
      modeLabel.className   = 'timer-mode-label' + (state.mode === 'break' ? ' break' : '');
    }

    if (statusLabel) {
      var statusMap = { idle: 'Siap', running: 'Berjalan', paused: 'Dijeda' };
      statusLabel.textContent = statusMap[state.status] || 'Siap';
    }

    if (startBtn) {
      startBtn.disabled = (state.status === 'running');
      startBtn.textContent = state.status === 'paused' ? '▶ Lanjut' : '▶ Mulai';
    }
    if (pauseBtn) {
      pauseBtn.disabled = (state.status !== 'running');
    }

    // Disable duration controls when running or paused
    var isIdle = state.status === 'idle';
    if (focusInput) focusInput.disabled = !isIdle;
    if (breakInput) breakInput.disabled = !isIdle;
    var saveBtn = document.getElementById('save-duration-btn');
    if (saveBtn) saveBtn.disabled = !isIdle;
  }

  /* Countdown */
  function countdown() {
    if (state.remaining > 0) {
      state.remaining--;
      render();
    } else {
      handleSessionComplete();
    }
  }

  function handleSessionComplete() {
    clearInterval(intervalId);
    intervalId = null;

    var message = state.mode === 'focus'
      ? '✅ Sesi fokus selesai! Waktunya istirahat.'
      : '🎯 Istirahat selesai! Kembali fokus.';

    showNotification(message);

    document.dispatchEvent(new CustomEvent('app:timer-complete', { detail: { mode: state.mode } }));

    // Switch mode
    if (state.mode === 'focus') {
      state.mode      = 'break';
      state.remaining = state.breakDuration * 60;
    } else {
      state.mode      = 'focus';
      state.remaining = state.focusDuration * 60;
    }
    state.status = 'idle';
    render();

    // Auto-start next session
    start();
  }

  function showNotification(msg) {
    var el = document.getElementById('timer-notification');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(function () {
      el.classList.remove('visible');
    }, 3500);
  }

  /* Controls */
  function start() {
    if (state.status === 'running') return;
    state.status = 'running';
    intervalId = setInterval(countdown, 1000);
    render();
  }

  function pause() {
    if (state.status !== 'running') return;
    clearInterval(intervalId);
    intervalId = null;
    state.status = 'paused';
    render();
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    state.remaining = state.mode === 'focus'
      ? state.focusDuration * 60
      : state.breakDuration * 60;
    state.status = 'idle';
    render();
  }

  function setFocusDuration(minutes) {
    var res = validateDuration(minutes, 1, 60);
    var errEl = document.getElementById('focus-duration-error');
    if (!res.valid) {
      if (errEl) errEl.textContent = res.error;
      return false;
    }
    if (errEl) errEl.textContent = '';
    state.focusDuration = res.value;
    if (state.status === 'idle' && state.mode === 'focus') {
      state.remaining = state.focusDuration * 60;
    }
    var cfg = Storage.loadConfig();
    cfg.focusDuration = state.focusDuration;
    Storage.saveConfig(cfg);
    render();
    return true;
  }

  function setBreakDuration(minutes) {
    var res = validateDuration(minutes, 1, 30);
    var errEl = document.getElementById('break-duration-error');
    if (!res.valid) {
      if (errEl) errEl.textContent = res.error;
      return false;
    }
    if (errEl) errEl.textContent = '';
    state.breakDuration = res.value;
    if (state.status === 'idle' && state.mode === 'break') {
      state.remaining = state.breakDuration * 60;
    }
    var cfg = Storage.loadConfig();
    cfg.breakDuration = state.breakDuration;
    Storage.saveConfig(cfg);
    render();
    return true;
  }

  function bindEvents() {
    var startBtn = document.getElementById('timer-start');
    var pauseBtn = document.getElementById('timer-pause');
    var resetBtn = document.getElementById('timer-reset');
    var saveBtn  = document.getElementById('save-duration-btn');

    if (startBtn) startBtn.addEventListener('click', start);
    if (pauseBtn) pauseBtn.addEventListener('click', pause);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var focusInput = document.getElementById('focus-duration-input');
        var breakInput = document.getElementById('break-duration-input');
        var focusOk = setFocusDuration(focusInput ? focusInput.value : 25);
        var breakOk = setBreakDuration(breakInput ? breakInput.value : 5);
        if (focusOk && breakOk) {
          showNotification('⚙️ Durasi berhasil diterapkan.');
        }
      });
    }
  }

  function init() {
    var cfg = Storage.loadConfig();
    state.focusDuration = cfg.focusDuration || 25;
    state.breakDuration = cfg.breakDuration || 5;
    state.remaining     = state.focusDuration * 60;
    state.mode          = 'focus';
    state.status        = 'idle';

    // Sync input fields
    var focusInput = document.getElementById('focus-duration-input');
    var breakInput = document.getElementById('break-duration-input');
    if (focusInput) focusInput.value = state.focusDuration;
    if (breakInput) breakInput.value = state.breakDuration;

    bindEvents();
    render();
  }

  return { init, start, pause, reset, setFocusDuration, setBreakDuration };
})();


/* ---------------------------------------------------------
   6. QuickLinks Module
   --------------------------------------------------------- */
var QuickLinks = (function () {
  var links    = [];
  var MAX_LINKS = 50;

  /* Helpers */
  function generateId() {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }
  }

  function validateLink(label, url) {
    var l = (label || '').trim();
    var u = (url   || '').trim();

    if (!l) return { valid: false, error: 'Label tidak boleh kosong.' };
    if (l.length > 50) return { valid: false, error: 'Label maksimal 50 karakter.' };
    if (!u) return { valid: false, error: 'URL tidak boleh kosong.' };
    if (!u.startsWith('http://') && !u.startsWith('https://')) {
      return { valid: false, error: 'URL harus diawali dengan http:// atau https://.' };
    }
    if (u.length > 2000) return { valid: false, error: 'URL terlalu panjang (maks 2000 karakter).' };
    if (links.length >= MAX_LINKS) return { valid: false, error: 'Daftar tautan sudah penuh (maksimal 50).' };

    var isDup = links.some(function (lk) { return lk.url === u; });
    if (isDup) return { valid: false, error: 'URL tersebut sudah terdaftar.' };

    return { valid: true };
  }

  /* Render */
  function render() {
    var list     = document.getElementById('link-list');
    var emptyMsg = document.getElementById('link-empty');
    if (!list) return;

    list.innerHTML = '';

    if (links.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    links.forEach(function (lk) {
      var li = document.createElement('li');
      li.className = 'link-item';
      li.dataset.id = lk.id;

      var anchor = document.createElement('button');
      anchor.className   = 'link-anchor';
      anchor.textContent = lk.label;
      anchor.setAttribute('aria-label', 'Buka ' + lk.label + ': ' + lk.url);
      anchor.addEventListener('click', function () { openLink(lk.url); });

      var delBtn = document.createElement('button');
      delBtn.className   = 'btn btn-sm btn-danger';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Hapus tautan: ' + lk.label);
      delBtn.addEventListener('click', function () { deleteLink(lk.id); });

      li.appendChild(anchor);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }

  /* CRUD */
  function addLink(label, url) {
    var errEl = document.getElementById('link-error');
    var res = validateLink(label, url);
    if (!res.valid) {
      if (errEl) errEl.textContent = res.error;
      return false;
    }
    if (errEl) errEl.textContent = '';
    links.push({ id: generateId(), label: label.trim(), url: url.trim(), createdAt: Date.now() });
    saveLinks();
    render();
    return true;
  }

  function deleteLink(id) {
    links = links.filter(function (lk) { return lk.id !== id; });
    saveLinks();
    render();
  }

  function openLink(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function saveLinks() {
    Storage.save(Storage.KEYS.links, links);
  }

  function init() {
    links = Storage.load(Storage.KEYS.links, []);

    var form       = document.getElementById('link-form');
    var labelInput = document.getElementById('link-label-input');
    var urlInput   = document.getElementById('link-url-input');
    var errEl      = document.getElementById('link-error');

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var label = labelInput ? labelInput.value : '';
        var url   = urlInput   ? urlInput.value   : '';
        if (addLink(label, url)) {
          if (labelInput) labelInput.value = '';
          if (urlInput)   urlInput.value   = '';
        }
      });
    }

    if (labelInput && errEl) labelInput.addEventListener('input', function () { errEl.textContent = ''; });
    if (urlInput   && errEl) urlInput.addEventListener('input',   function () { errEl.textContent = ''; });

    render();
  }

  return { init, addLink, deleteLink, openLink };
})();


/* ---------------------------------------------------------
   7. App Init — DOMContentLoaded
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  // 1. ThemeToggle first (prevents FOUC after DOM loads)
  ThemeToggle.init();

  // 2. Clock
  Clock.init();

  // 3. TaskList
  TaskList.init();

  // 4. FocusTimer
  FocusTimer.init();

  // 5. QuickLinks
  QuickLinks.init();
});
