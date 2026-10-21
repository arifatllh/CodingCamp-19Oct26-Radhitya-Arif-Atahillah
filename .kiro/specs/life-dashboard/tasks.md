# Implementation Plan: Life Dashboard

## Overview

Implementasi Life Dashboard sebagai SPA sederhana menggunakan HTML, CSS, dan Vanilla JavaScript murni. Pendekatan incremental: mulai dari struktur proyek dan fondasi data (Storage), lalu modul-modul fungsional secara berurutan, diakhiri dengan wiring dan polish. Semua kode JS ditulis dalam satu file `js/app.js` menggunakan IIFE Module Pattern.

## Tasks

- [ ] 1. Setup struktur proyek
  - [ ] 1.1 Buat file `index.html` dengan skeleton HTML5 semantik
    - Tambahkan `<!DOCTYPE html>`, `<html lang="id">`, `<head>`, `<body>`
    - Sertakan `<meta charset>`, `<meta name="viewport">`, `<title>Life Dashboard</title>`
    - Tambahkan `<link rel="stylesheet" href="css/style.css">`
    - Tambahkan `<script src="js/app.js" defer></script>`
    - Buat placeholder section untuk setiap komponen: `#clock`, `#task-list`, `#focus-timer`, `#quick-links`
    - Tambahkan elemen toggle tema di `<header>` atau area navigasi
    - _Requirements: 5.1, TC-1, TC-4_
  - [ ] 1.2 Buat file `css/style.css` kosong dan `js/app.js` kosong
    - Buat direktori `css/` dan `js/` di root proyek
    - Buat file `css/style.css` dengan komentar header
    - Buat file `js/app.js` dengan komentar header dan `'use strict';`
    - _Requirements: TC-4_

- [ ] 2. Implementasi Storage Module
  - [ ] 2.1 Tulis Storage IIFE di `js/app.js`
    - Implementasikan `Storage.save(key, value)` — JSON.stringify + localStorage.setItem dalam try/catch
    - Implementasikan `Storage.load(key, fallback)` — localStorage.getItem + JSON.parse dalam try/catch; kembalikan `fallback` jika null atau error
    - Implementasikan `Storage.remove(key)` — localStorage.removeItem
    - Implementasikan `Storage.clear()` — hapus hanya key yang berawalan `ld:`
    - Definisikan storage keys sebagai konstanta: `ld:tasks`, `ld:links`, `ld:config`
    - Definisikan `DEFAULT_CONFIG = { userName: '', darkMode: false, focusDuration: 25, breakDuration: 5 }`
    - _Requirements: TC-2, 2.15, 2.16, 4.9, 4.10, 6.4_
  - [ ]* 2.2 Tulis property test untuk Storage round-trip (Property 1)
    - **Property 1: Storage round-trip preserves data**
    - **Validates: Requirements 2.15, 2.16, 4.9, 4.10, 6.4**
    - Gunakan fast-check: `fc.property(fc.object(), obj => JSON.parse(JSON.stringify(obj)) deep-equals obj)`
    - Test dengan Task, Link, dan AppConfig sebagai arbitrary

- [ ] 3. Implementasi ThemeToggle Module + Anti-FOUC
  - [ ] 3.1 Tambahkan inline script anti-FOUC di `<head>` `index.html` sebelum `<link>` CSS
    - Script membaca `ld:config` dari localStorage, jika `darkMode === true` langsung set `document.documentElement.setAttribute('data-theme', 'dark')`
    - Wrap dalam IIFE + try/catch agar tidak memblokir parsing jika localStorage tidak tersedia
    - _Requirements: 6.5_
  - [ ] 3.2 Tulis ThemeToggle IIFE di `js/app.js`
    - Implementasikan `ThemeToggle.init()` — baca preferensi dari Storage, terapkan `data-theme` attribute dan set state tombol toggle
    - Implementasikan `ThemeToggle.toggle()` — flip nilai `darkMode`, update `data-theme` pada `<html>`, simpan ke Storage via `Storage.save`
    - Implementasikan `ThemeToggle.getCurrent()` — kembalikan `'dark'` atau `'light'` sesuai state aktif
    - Dispatch Custom Event `app:theme-changed` pada `document` setelah toggle
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7_
  - [ ]* 3.3 Tulis property test untuk dark mode toggle round-trip (Property 14)
    - **Property 14: Dark mode toggle adalah round-trip**
    - **Validates: Requirements 6.2, 6.3, 6.4**
    - Test: toggle dua kali → state kembali identik dengan state awal

- [ ] 4. Implementasi CSS: custom properties, layout, dan base styling
  - [ ] 4.1 Definisikan CSS custom properties dan dark mode override di `css/style.css`
    - Definisikan variabel di `:root`: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--accent`, `--border`, dll.
    - Definisikan override di `[data-theme="dark"]` untuk semua variabel
    - Tambahkan CSS reset/normalize minimal (`box-sizing: border-box`, margin/padding reset)
    - Pilih font stack yang mudah dibaca (system-ui atau Google Fonts via `@import`)
    - _Requirements: NFR-1, 6.2, 6.3_
  - [ ] 4.2 Implementasikan layout grid responsif di `css/style.css`
    - Layout utama: CSS Grid 2-kolom untuk lebar ≥ 1024px (Clock+TaskList di kolom kiri, Timer+Links di kolom kanan)
    - Media query `@media (max-width: 1023px) and (min-width: 768px)`: 2 kolom, lebar kolom ≥ 45% viewport
    - Media query `@media (max-width: 767px)`: 1 kolom, lebar 100%, tidak ada overflow horizontal
    - Tambahkan `.container` wrapper dengan max-width dan auto margin
    - _Requirements: 5.2, 5.3, 5.4_
  - [ ] 4.3 Tambahkan styling komponen, tipografi, dan animasi transisi di `css/style.css`
    - Style untuk card komponen (border-radius, shadow, padding)
    - Style untuk tombol (primary, secondary, danger), input, dan form
    - Style strikethrough + opacity reduced untuk task yang selesai
    - Style untuk inline error messages (warna merah, posisi di bawah input)
    - Transisi CSS untuk theme toggle (`transition: background-color 0.2s, color 0.2s`)
    - Style untuk notifikasi FocusTimer (`.timer-notification`)
    - _Requirements: NFR-1, NFR-3, 2.6_

- [ ] 5. Implementasi Clock Module
  - [ ] 5.1 Tulis Clock IIFE dan fungsi helper greeting di `js/app.js`
    - Implementasikan `getGreeting(hour)` — pure function, kembalikan string greeting berdasarkan hour 0–23
    - Implementasikan `formatGreeting(greeting, name)` — kembalikan `"{greeting}, {name}!"` jika name non-empty, atau `"{greeting}!"` jika kosong
    - Implementasikan format jam `HH:MM:SS` (padStart dengan '0')
    - Implementasikan format tanggal dengan `Intl.DateTimeFormat('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })`
    - _Requirements: 1.2, 1.4, 1.6, 1.7, 1.8_
  - [ ]* 5.2 Tulis property test untuk greeting (Property 2 & 3)
    - **Property 2: Greeting selalu sesuai jam**
    - **Validates: Requirements 1.6**
    - **Property 3: Greeting dengan nama vs tanpa nama**
    - **Validates: Requirements 1.7, 1.8**
    - Test Property 2: `fc.integer({min:0,max:23})` → hasil harus salah satu dari 4 string yang terdefinisi
    - Test Property 3: `fc.string({minLength:1})` → format berakhiran `", {name}!"`; `fc.constant('')` → berakhiran `"!"`
  - [ ] 5.3 Implementasikan `Clock.init()`, tick interval, dan UI nama pengguna di `js/app.js`
    - `Clock.init()`: render pertama kali, jalankan `setInterval(tick, 1000)`
    - `tick()`: update jam, cek perubahan hari (bandingkan date string), cek perubahan rentang greeting
    - `Clock.setUserName(name)`: simpan nama ke Storage (`ld:config`), update tampilan greeting segera
    - `Clock.clearUserName()`: hapus nama dari Storage, update tampilan greeting segera
    - Tambahkan form/input di HTML untuk mengatur nama pengguna
    - Dispatch Custom Event `app:username-saved` pada `document` setelah simpan
    - _Requirements: 1.1, 1.3, 1.5, 1.9, 1.10, 1.11_

- [ ] 6. Implementasi TaskList Module
  - [ ] 6.1 Tulis fungsi validasi dan helper TaskList di `js/app.js`
    - Fungsi `generateId()` — gunakan `crypto.randomUUID()` atau fallback timestamp+random
    - Fungsi `validateTaskText(text, existingTasks, excludeId)` — cek kosong, > 200 karakter, duplikat setelah trim; kembalikan `{valid: bool, error: string|null}`
    - Definisikan pesan error dalam Bahasa Indonesia: "Deskripsi tugas tidak boleh kosong.", "Deskripsi tugas maksimal 200 karakter.", "Tugas dengan deskripsi yang sama sudah ada."
    - _Requirements: 2.3, 2.4, 2.5, 2.10, 2.11_
  - [ ] 6.2 Implementasikan `TaskList.addTask()`, `toggleTask()`, `deleteTask()` di `js/app.js`
    - `TaskList.init()`: muat dari Storage (`ld:tasks`), render daftar task
    - `TaskList.addTask(text)`: validasi → buat Task object `{id, text: text.trim(), done: false, createdAt: Date.now()}` → push ke array → simpan ke Storage → re-render
    - `TaskList.toggleTask(id)`: flip `done` → simpan → re-render
    - `TaskList.deleteTask(id)`: filter array → simpan → re-render
    - Tampilkan pesan error inline di bawah input saat validasi gagal
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 2.13, 2.15, 2.16, 2.17_
  - [ ]* 6.3 Tulis property test untuk penambahan task dan validasi (Property 4 & 5)
    - **Property 4: Penambahan task memperbesar daftar**
    - **Validates: Requirements 2.2**
    - **Property 5: Teks kosong dan duplikat ditolak**
    - **Validates: Requirements 2.3, 2.5**
    - Test Property 4: `fc.array(validTaskArb)` + `fc.string({minLength:1,maxLength:200})` → panjang array bertambah tepat 1
    - Test Property 5: whitespace-only string → daftar tidak berubah; duplicate text → daftar tidak berubah
  - [ ]* 6.4 Tulis property test untuk toggle task (Property 6)
    - **Property 6: Toggle status task adalah involution**
    - **Validates: Requirements 2.6, 2.7**
    - Test: toggle dua kali → status `done` sama dengan awal
  - [ ] 6.5 Implementasikan `TaskList.editTask()` dan edit inline di `js/app.js`
    - `TaskList.editTask(id, newText)`: validasi (beda dengan id yang di-edit, cek duplikat dengan task lain) → update `text` → simpan → re-render
    - UI: klik tombol edit → ganti `<span>` teks dengan `<input>` pre-filled; konfirmasi via Enter atau tombol save; batal via Escape atau tombol cancel
    - Saat edit aktif: tampilkan error inline jika validasi gagal
    - _Requirements: 2.8, 2.9, 2.10, 2.11, 2.12_
  - [ ] 6.6 Implementasikan `TaskList.sortBy()` dan UI sort di `js/app.js`
    - `TaskList.sortBy(sortOrder)`: sort array tasks in-memory sesuai SortOrder (`created-newest`, `created-oldest`, `incomplete-first`, `complete-first`) → re-render tanpa mengubah data yang tersimpan
    - Tambahkan `<select>` atau tombol sort di HTML
    - Untuk `incomplete-first`/`complete-first`: sort primer berdasarkan `done`, sort sekunder berdasarkan `createdAt`
    - _Requirements: 2.14_
  - [ ]* 6.7 Tulis property test untuk sorting task (Property 7 & 8)
    - **Property 7: Sorting task tidak mengubah isi, hanya urutan**
    - **Validates: Requirements 2.14**
    - **Property 8: Sorting incomplete-first mempertahankan urutan relatif dalam grup**
    - **Validates: Requirements 2.14**
    - Test Property 7: `fc.array(taskArb)` + `fc.constantFrom(sortOrders)` → jumlah dan konten tasks identik sebelum/sesudah sort
    - Test Property 8: setelah `incomplete-first`, semua `done===false` sebelum `done===true`

- [ ] 7. Checkpoint — Verifikasi modul Clock dan TaskList
  - Pastikan semua test property berjalan (jika diimplementasikan), tidak ada console error, data task persist di localStorage setelah refresh. Tanyakan ke user jika ada pertanyaan.

- [ ] 8. Implementasi FocusTimer Module
  - [ ] 8.1 Tulis fungsi validasi durasi dan state machine FocusTimer di `js/app.js`
    - Fungsi `validateFocusDuration(n)` — cek integer, 1 ≤ n ≤ 60; kembalikan `{valid, error}`
    - Fungsi `validateBreakDuration(n)` — cek integer, 1 ≤ n ≤ 30; kembalikan `{valid, error}`
    - Pesan error: "Durasi fokus harus antara 1 hingga 60 menit.", "Durasi istirahat harus antara 1 hingga 30 menit.", "Masukkan bilangan bulat yang valid."
    - Definisikan state awal timer: `{mode:'focus', status:'idle', remaining: focusDuration*60, focusDuration:25, breakDuration:5}`
    - _Requirements: 3.14, 3.15_
  - [ ]* 8.2 Tulis property test untuk validasi durasi FocusTimer (Property 13)
    - **Property 13: CustomDuration di luar rentang ditolak**
    - **Validates: Requirements 3.14, 3.15**
    - Test: `fc.integer().filter(n => n < 1 || n > 60)` → `setFocusDuration` mengembalikan error dan nilai Storage tidak berubah
  - [ ] 8.3 Implementasikan `FocusTimer.init()`, `start()`, `pause()`, `reset()` di `js/app.js`
    - `FocusTimer.init()`: muat `focusDuration` dan `breakDuration` dari Storage (`ld:config`), set `remaining = focusDuration * 60`, render UI
    - `FocusTimer.start()`: ubah status ke `running`, jalankan `setInterval(countdown, 1000)`; jika sudah ada interval, jangan buat baru (resume)
    - `FocusTimer.pause()`: ubah status ke `paused`, clear interval
    - `FocusTimer.reset()`: clear interval, set `status='idle'`, `remaining = currentModeDuration * 60`, re-render; aktifkan kembali input durasi
    - Render MM:SS format (`String(Math.floor(r/60)).padStart(2,'0') + ':' + String(r%60).padStart(2,'0')`)
    - Tampilkan label sesi ("Focus" / "Break") dan indikator status di UI
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.11, 3.17_
  - [ ]* 8.4 Tulis property test untuk countdown monoton dan reset (Property 11 & 12)
    - **Property 11: FocusTimer countdown monoton menurun**
    - **Validates: Requirements 3.3**
    - **Property 12: Reset timer mengembalikan ke durasi penuh sesi aktif**
    - **Validates: Requirements 3.5, 3.6**
    - Test Property 11: simulasikan N tick saat `status==='running'` → setiap tick `remaining` berkurang tepat 1
    - Test Property 12: `fc.constantFrom('focus','break')` + random `remaining` → setelah `reset()`, `remaining === modeDuration * 60` dan `status === 'idle'`
  - [ ] 8.5 Implementasikan auto-switch Focus↔Break dan notifikasi in-UI di `js/app.js`
    - Dalam fungsi `countdown()`: jika `remaining === 0`, clear interval, tampilkan notifikasi, auto-switch mode, set `status='idle'`, lalu panggil `start()` untuk memulai sesi baru
    - Dispatch Custom Event `app:timer-complete` pada `document` saat sesi selesai
    - Buat elemen `<div class="timer-notification">` di dalam seksi FocusTimer HTML; tampilkan 3 detik lalu hilangkan (atau hilangkan saat user klik)
    - _Requirements: 3.7, 3.8, 3.9, 3.10_
  - [ ] 8.6 Implementasikan `setFocusDuration()`, `setBreakDuration()`, dan disable control di `js/app.js`
    - `FocusTimer.setFocusDuration(minutes)`: validasi → update `focusDuration` di state dan Storage (`ld:config`) → jika `status==='idle' && mode==='focus'`, update `remaining` → re-render
    - `FocusTimer.setBreakDuration(minutes)`: validasi → update `breakDuration` di state dan Storage → jika `status==='idle' && mode==='break'`, update `remaining` → re-render
    - Saat `status !== 'idle'`: set atribut `disabled` pada input durasi di DOM
    - Saat `status === 'idle'`: hapus atribut `disabled` dari input durasi
    - _Requirements: 3.12, 3.13, 3.14, 3.15, 3.16, 3.17_

- [ ] 9. Implementasi QuickLinks Module
  - [ ] 9.1 Tulis fungsi validasi link di `js/app.js`
    - Fungsi `validateLinkLabel(label)` — cek kosong; kembalikan `{valid, error}`
    - Fungsi `validateLinkUrl(url, existingLinks)` — cek kosong, cek prefix `http://`/`https://`, cek duplikat exact match; kembalikan `{valid, error}`
    - Pesan error: "Label tidak boleh kosong.", "URL tidak boleh kosong.", "URL harus diawali dengan http:// atau https://.", "URL tersebut sudah terdaftar.", "Daftar tautan sudah penuh (maksimal 50)."
    - _Requirements: 4.3, 4.4, 4.5_
  - [ ]* 9.2 Tulis property test untuk validasi URL dan kapasitas (Property 9 & 10)
    - **Property 9: Validasi URL Quick Links**
    - **Validates: Requirements 4.4**
    - **Property 10: Kapasitas Quick Links tidak terlampaui**
    - **Validates: Requirements 4.1, 4.6**
    - Test Property 9: string tanpa prefix `http://`/`https://` → invalid; string dengan prefix → valid
    - Test Property 10: array 50 link + tambah satu lagi → selalu ditolak, panjang tetap 50
  - [ ] 9.3 Implementasikan `QuickLinks.init()`, `addLink()`, `deleteLink()`, `openLink()` di `js/app.js`
    - `QuickLinks.init()`: muat dari Storage (`ld:links`), render daftar
    - `QuickLinks.addLink(label, url)`: cek kapasitas (max 50) → validasi label → validasi URL → buat Link object `{id, label, url, createdAt: Date.now()}` → push → simpan → re-render
    - `QuickLinks.deleteLink(id)`: filter array → simpan ke Storage → re-render
    - `QuickLinks.openLink(url)`: `window.open(url, '_blank', 'noopener,noreferrer')`
    - Tampilkan error inline saat validasi gagal
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

- [ ] 10. Wiring dan polish akhir
  - [ ] 10.1 Implementasikan urutan inisialisasi modul di `js/app.js`
    - Tambahkan event listener `DOMContentLoaded` di akhir `app.js`
    - Urutan init yang tepat: `Storage.init()` → `ThemeToggle.init()` → `Clock.init()` → `TaskList.init()` → `FocusTimer.init()` → `QuickLinks.init()`
    - Pastikan tidak ada module yang dipanggil sebelum DOM siap
    - _Requirements: TC-1, TC-3, NFR-2_
  - [ ] 10.2 Tambahkan aksesibilitas dasar ke HTML dan CSS
    - Tambahkan atribut `aria-label` pada tombol ikon (toggle tema, hapus task, hapus link, edit task)
    - Pastikan semua form input punya `<label>` yang terhubung via `for`/`id`
    - Tambahkan atribut `role` dan `aria-live="polite"` pada area error message dan notifikasi timer
    - Pastikan urutan tab (tabindex) logis untuk keyboard navigation
    - _Requirements: NFR-1_
  - [ ] 10.3 Verifikasi integrasi penuh dan tidak ada console error
    - Buka `index.html` langsung di browser (file://) — tidak boleh ada 404, tidak ada uncaught exception di console
    - Verifikasi semua data (tasks, links, config) persist di localStorage setelah refresh
    - Pastikan tidak ada `setInterval` yang bocor: clear interval lama sebelum membuat baru di FocusTimer
    - Pastikan ThemeToggle anti-FOUC berfungsi: muat halaman dalam dark mode → tidak ada flash terang
    - _Requirements: TC-3, NFR-2, NFR-3, 2.16, 4.10, 6.5_

- [ ] 11. Checkpoint Akhir — Semua komponen terintegrasi
  - Pastikan semua test property berjalan tanpa error, semua checklist manual di design.md dapat dipenuhi, dan tidak ada console error. Tanyakan ke user jika ada pertanyaan.

## Notes

- Task yang diberi tanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Urutan implementasi mengikuti dependency: Storage harus ada sebelum modul lain; ThemeToggle harus init sebelum komponen lain untuk mencegah FOUC
- Property tests menggunakan **fast-check** (opsional, hanya untuk testing — tidak masuk production bundle)
- Setiap modul ditulis sebagai IIFE yang di-assign ke `window` agar dapat diakses antar modul
- Semua storage key menggunakan prefix `ld:` untuk menghindari collision
- Pastikan `window.open` selalu menggunakan `'noopener,noreferrer'` untuk keamanan (reverse tabnapping)
- Untuk fast-check, install dengan `npm install --save-dev fast-check` — tidak diperlukan untuk production

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2"] },
    { "id": 4, "tasks": ["3.3", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3"] },
    { "id": 6, "tasks": ["5.1"] },
    { "id": 7, "tasks": ["5.2", "5.3"] },
    { "id": 8, "tasks": ["6.1"] },
    { "id": 9, "tasks": ["6.2"] },
    { "id": 10, "tasks": ["6.3", "6.4", "6.5"] },
    { "id": 11, "tasks": ["6.6", "6.7"] },
    { "id": 12, "tasks": ["8.1"] },
    { "id": 13, "tasks": ["8.2", "8.3"] },
    { "id": 14, "tasks": ["8.4", "8.5"] },
    { "id": 15, "tasks": ["8.6"] },
    { "id": 16, "tasks": ["9.1"] },
    { "id": 17, "tasks": ["9.2", "9.3"] },
    { "id": 18, "tasks": ["10.1"] },
    { "id": 19, "tasks": ["10.2", "10.3"] }
  ]
}
```
