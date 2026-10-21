# Requirements Document

## Introduction

Life Dashboard adalah sebuah halaman web yang berfungsi sebagai dasbor kehidupan sehari-hari. Halaman ini dapat dijalankan langsung di browser tanpa instalasi tambahan dan menampilkan lima komponen utama: jam dan tanggal real-time beserta salam personal, daftar tugas (to-do list), pengatur waktu fokus bergaya Pomodoro, tautan cepat ke berbagai situs web favorit pengguna, serta toggle mode terang/gelap. Tujuannya adalah membantu pengguna mengatur aktivitas harian mereka dalam satu tampilan terpadu yang nyaman dan personal.

## Glossary

- **Dashboard**: Halaman web utama yang menampilkan semua komponen Life Dashboard.
- **Clock**: Komponen yang menampilkan jam dan tanggal saat ini secara real-time beserta salam berdasarkan waktu.
- **Greeting**: Pesan salam yang ditampilkan Clock berdasarkan rentang waktu dalam sehari, disertai nama pengguna jika telah disimpan (contoh: "Selamat Pagi, Budi!").
- **Task_List**: Komponen daftar tugas yang memungkinkan pengguna menambah, mengedit, menyelesaikan, menghapus, dan mengurutkan tugas.
- **Task**: Satu item dalam Task_List yang memiliki teks deskripsi, status (selesai atau belum selesai), dan timestamp pembuatan.
- **SortOrder**: Kriteria pengurutan Task dalam Task_List; salah satu dari: waktu dibuat terbaru, waktu dibuat terlama, belum selesai dulu, atau selesai dulu.
- **Focus_Timer**: Komponen pengatur waktu fokus bergaya Pomodoro yang mendukung sesi kerja dan sesi istirahat dengan durasi yang dapat dikustomisasi.
- **Focus_Session**: Periode waktu kerja terfokus dalam Focus_Timer, dengan durasi default 25 menit dan rentang 1–60 menit.
- **Break_Session**: Periode waktu istirahat dalam Focus_Timer setelah Focus_Session selesai, dengan durasi default 5 menit dan rentang 1–30 menit.
- **CustomDuration**: Nilai durasi Focus_Session atau Break_Session yang diatur oleh pengguna dan disimpan di Local_Storage.
- **Quick_Links**: Komponen yang menyimpan dan menampilkan daftar tautan cepat ke situs web.
- **Link**: Satu item dalam Quick_Links yang memiliki label teks dan URL tujuan.
- **DarkMode**: Mode tampilan Dashboard dengan skema warna gelap yang mengurangi kecerahan layar. Kebalikannya adalah Light Mode dengan skema warna terang.
- **Local_Storage**: Mekanisme penyimpanan data di browser yang mempertahankan data antar sesi tanpa server.

---

## Technical Constraints

- **TC-1**: THE Dashboard SHALL diimplementasikan menggunakan HTML, CSS, dan Vanilla JavaScript tanpa framework JavaScript eksternal dan tanpa server backend.
- **TC-2**: THE Dashboard SHALL menyimpan semua data pengguna (Task, Link, preferensi nama, CustomDuration, preferensi DarkMode) di Local_Storage sehingga tidak ada data yang dikirimkan ke server eksternal.
- **TC-3**: THE Dashboard SHALL dapat dijalankan langsung di browser Chrome 120+, Firefox 120+, Edge 120+, dan Safari 17+ tanpa memerlukan proses build atau test setup.
- **TC-4**: THE Dashboard SHALL menggunakan tepat satu file CSS di `css/style.css` dan tepat satu file JavaScript di `js/app.js`.

## Non-Functional Requirements

- **NFR-1**: THE Dashboard SHALL memiliki antarmuka yang bersih dan minimalis dengan tipografi yang mudah dibaca.
- **NFR-2**: WHEN halaman Dashboard dimuat, THE Dashboard SHALL selesai merender seluruh komponen dalam waktu kurang dari 2 detik pada koneksi lokal.
- **NFR-3**: WHILE Dashboard terbuka, THE Dashboard SHALL tidak menampilkan lag yang terlihat (frame drop) pada operasi UI seperti menambah Task, mengklik Link, atau toggle DarkMode.

---

## Requirements

### Requirement 1: Tampilan Jam, Tanggal, dan Salam Personal Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat jam dan tanggal saat ini secara real-time beserta salam personal berdasarkan waktu, sehingga saya selalu mengetahui waktu dan merasa disambut dengan ramah.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan komponen Clock pada halaman utama.
2. WHEN halaman Dashboard dimuat, THE Clock SHALL menampilkan jam, menit, dan detik saat ini dalam format 24 jam (HH:MM:SS) berdasarkan waktu lokal sistem pengguna.
3. WHILE Dashboard terbuka, THE Clock SHALL memperbarui tampilan jam, menit, dan detik berdasarkan waktu lokal sistem pengguna setiap 1000 milidetik.
4. WHEN halaman Dashboard dimuat, THE Clock SHALL menampilkan tanggal saat ini berdasarkan waktu lokal sistem pengguna dalam format nama hari, tanggal, nama bulan, dan tahun dalam Bahasa Indonesia (contoh: Senin, 21 Oktober 2026).
5. WHILE Dashboard terbuka, WHEN hari berganti berdasarkan waktu lokal sistem pengguna, THE Clock SHALL memperbarui tampilan tanggal ke hari yang baru.
6. WHILE Dashboard terbuka, THE Clock SHALL menampilkan Greeting berdasarkan jam lokal sistem pengguna: "Selamat Pagi" pada rentang 05:00–11:59, "Selamat Siang" pada rentang 12:00–14:59, "Selamat Sore" pada rentang 15:00–17:59, dan "Selamat Malam" pada rentang 18:00–04:59.
7. WHEN nama pengguna tersimpan di Local_Storage, THE Clock SHALL menampilkan Greeting dalam format "[Greeting], [Nama]!" (contoh: "Selamat Pagi, Budi!").
8. IF tidak ada nama pengguna di Local_Storage, THEN THE Clock SHALL menampilkan Greeting tanpa nama (contoh: "Selamat Pagi!").
9. WHEN pengguna menyimpan nama melalui antarmuka pengaturan nama, THE Clock SHALL menyimpan nama tersebut ke Local_Storage dan segera memperbarui tampilan Greeting.
10. WHEN pengguna menghapus nama melalui antarmuka pengaturan nama, THE Clock SHALL menghapus nama dari Local_Storage dan segera menampilkan Greeting tanpa nama.
11. WHILE Dashboard terbuka, WHEN rentang waktu dalam sehari berubah berdasarkan waktu lokal sistem pengguna, THE Clock SHALL memperbarui Greeting sesuai rentang waktu yang baru.

---

### Requirement 2: Daftar Tugas (To-Do List)

**User Story:** Sebagai pengguna, saya ingin mengelola daftar tugas harian saya termasuk mengedit dan mengurutkan tugas, sehingga saya dapat melacak dan memprioritaskan aktivitas yang perlu diselesaikan.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan komponen Task_List yang berisi daftar Task.
2. WHEN pengguna memasukkan teks tugas dengan panjang 1 hingga 200 karakter dan mengonfirmasi penambahan, THE Task_List SHALL menambahkan Task baru dengan status belum selesai dan timestamp pembuatan saat ini ke dalam daftar.
3. IF pengguna mengonfirmasi penambahan Task dengan teks kosong atau teks yang hanya berisi karakter spasi, THEN THE Task_List SHALL menampilkan pesan kesalahan dan tidak menambahkan Task baru.
4. IF pengguna mengonfirmasi penambahan Task dengan teks yang melebihi 200 karakter, THEN THE Task_List SHALL menampilkan pesan kesalahan yang menyebutkan batas karakter dan tidak menambahkan Task baru.
5. IF pengguna mengonfirmasi penambahan Task dengan teks yang — setelah karakter spasi di awal dan akhir dihilangkan — identik dengan teks Task yang sudah ada dalam daftar, THEN THE Task_List SHALL menampilkan pesan kesalahan yang mengindikasikan tugas duplikat dan tidak menambahkan Task baru.
6. WHEN pengguna menandai sebuah Task yang belum selesai sebagai selesai, THE Task_List SHALL memperbarui status Task tersebut menjadi selesai dan menampilkan teks Task dengan garis coret (strikethrough) serta opacity yang dikurangi dibandingkan Task belum selesai.
7. WHEN pengguna menandai sebuah Task yang sudah selesai, THE Task_List SHALL memperbarui status Task tersebut kembali menjadi belum selesai dan menghilangkan tampilan garis coret serta opacity yang dikurangi.
8. WHEN pengguna memilih opsi edit pada sebuah Task, THE Task_List SHALL menampilkan teks Task tersebut dalam mode yang dapat diedit.
9. WHEN pengguna mengonfirmasi hasil edit sebuah Task dengan teks baru yang memiliki panjang 1 hingga 200 karakter, THE Task_List SHALL memperbarui teks Task tersebut dan menyimpan perubahan ke Local_Storage.
10. IF pengguna mengonfirmasi hasil edit sebuah Task dengan teks kosong, teks yang hanya berisi karakter spasi, atau teks yang melebihi 200 karakter, THEN THE Task_List SHALL menampilkan pesan kesalahan dan tidak memperbarui teks Task.
11. IF pengguna mengonfirmasi hasil edit sebuah Task dengan teks yang — setelah karakter spasi di awal dan akhir dihilangkan — identik dengan teks Task lain yang sudah ada dalam daftar, THEN THE Task_List SHALL menampilkan pesan kesalahan yang mengindikasikan tugas duplikat dan tidak memperbarui teks Task.
12. WHEN pengguna membatalkan edit sebuah Task, THE Task_List SHALL mengembalikan tampilan Task ke teks semula tanpa perubahan.
13. WHEN pengguna menghapus sebuah Task, THE Task_List SHALL menghilangkan Task tersebut dari daftar secara permanen.
14. WHEN pengguna memilih SortOrder, THE Task_List SHALL menyusun ulang tampilan seluruh Task sesuai SortOrder yang dipilih: waktu dibuat terbaru (timestamp terbesar ke terkecil), waktu dibuat terlama (timestamp terkecil ke terbesar), belum selesai dulu (Task dengan status belum selesai ditampilkan sebelum Task selesai), atau selesai dulu (Task dengan status selesai ditampilkan sebelum Task belum selesai).
15. WHEN pengguna menambah, mengedit, menyelesaikan, atau menghapus sebuah Task, THE Task_List SHALL menyimpan seluruh data Task ke Local_Storage.
16. WHEN halaman Dashboard dimuat, THE Task_List SHALL memuat dan menampilkan data Task yang tersimpan di Local_Storage.
17. IF tidak ada data Task di Local_Storage saat halaman dimuat, THEN THE Task_List SHALL menampilkan daftar kosong tanpa pesan kesalahan.

---

### Requirement 3: Pengatur Waktu Fokus (Focus Timer / Pomodoro)

**User Story:** Sebagai pengguna, saya ingin menggunakan pengatur waktu fokus bergaya Pomodoro dengan durasi yang dapat saya kustomisasi, sehingga saya dapat bekerja secara terfokus sesuai preferensi dan menjaga keseimbangan antara kerja dan istirahat.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan komponen Focus_Timer dengan tampilan waktu mundur dalam format MM:SS.
2. WHEN halaman Dashboard dimuat, THE Focus_Timer SHALL menampilkan durasi Focus_Session yang tersimpan di Local_Storage atau durasi default 25 menit (25:00) jika tidak ada data tersimpan.
3. WHEN pengguna memulai Focus_Timer, THE Focus_Timer SHALL menghitung mundur dari durasi yang tersisa setiap 1000 milidetik.
4. WHEN pengguna menjeda Focus_Timer, THE Focus_Timer SHALL menghentikan perhitungan mundur dan mempertahankan sisa waktu.
5. WHEN pengguna mereset Focus_Timer saat Focus_Session aktif, THE Focus_Timer SHALL menghentikan perhitungan mundur dan mengembalikan tampilan ke durasi Focus_Session saat ini.
6. WHEN pengguna mereset Focus_Timer saat Break_Session aktif, THE Focus_Timer SHALL menghentikan perhitungan mundur dan mengembalikan tampilan ke durasi Break_Session saat ini.
7. WHEN hitungan mundur Focus_Session mencapai nol, THE Focus_Timer SHALL menampilkan pesan notifikasi di dalam antarmuka bahwa Focus_Session telah selesai.
8. WHEN hitungan mundur Focus_Session mencapai nol, THE Focus_Timer SHALL secara otomatis beralih ke Break_Session dengan durasi Break_Session saat ini dan mulai menghitung mundur tanpa interaksi pengguna.
9. WHEN hitungan mundur Break_Session mencapai nol, THE Focus_Timer SHALL menampilkan pesan notifikasi di dalam antarmuka bahwa Break_Session telah selesai.
10. WHEN hitungan mundur Break_Session mencapai nol, THE Focus_Timer SHALL secara otomatis beralih ke Focus_Session baru dengan durasi Focus_Session saat ini dan mulai menghitung mundur tanpa interaksi pengguna.
11. THE Focus_Timer SHALL menampilkan label sesi ("Focus" atau "Break") dan indikator status (berjalan atau dijeda) yang terlihat jelas di antarmuka.
12. WHILE Focus_Timer berada dalam status idle (belum dimulai atau setelah direset), THE Focus_Timer SHALL menampilkan kontrol yang memungkinkan pengguna mengubah CustomDuration Focus_Session dengan nilai bilangan bulat antara 1 dan 60 menit.
13. WHILE Focus_Timer berada dalam status idle (belum dimulai atau setelah direset), THE Focus_Timer SHALL menampilkan kontrol yang memungkinkan pengguna mengubah CustomDuration Break_Session dengan nilai bilangan bulat antara 1 dan 30 menit.
14. IF pengguna memasukkan CustomDuration Focus_Session di luar rentang 1–60 menit, THEN THE Focus_Timer SHALL menampilkan pesan kesalahan dan tidak mengubah durasi Focus_Session.
15. IF pengguna memasukkan CustomDuration Break_Session di luar rentang 1–30 menit, THEN THE Focus_Timer SHALL menampilkan pesan kesalahan dan tidak mengubah durasi Break_Session.
16. WHEN pengguna menyimpan CustomDuration yang valid, THE Focus_Timer SHALL menyimpan nilai tersebut ke Local_Storage dan memperbarui tampilan waktu mundur sesuai durasi baru.
17. WHEN Focus_Timer sedang berjalan atau dijeda (bukan idle), THE Focus_Timer SHALL menonaktifkan kontrol pengubah CustomDuration sehingga pengguna tidak dapat mengubah durasi.

---

### Requirement 4: Tautan Cepat (Quick Links)

**User Story:** Sebagai pengguna, saya ingin menyimpan dan mengakses tautan cepat ke situs web favorit saya, sehingga saya dapat membuka situs tersebut dengan cepat tanpa mengetik URL secara manual.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan komponen Quick_Links yang berisi daftar Link dengan kapasitas maksimum 50 Link.
2. WHEN pengguna memasukkan label dengan panjang 1–50 karakter dan URL dengan panjang 1–2000 karakter yang diawali `http://` atau `https://` kemudian mengonfirmasi penambahan, THE Quick_Links SHALL menambahkan Link baru ke dalam daftar.
3. IF pengguna mengonfirmasi penambahan Link dengan label kosong atau URL kosong, THEN THE Quick_Links SHALL menampilkan pesan kesalahan yang mengindikasikan field mana yang kosong dan tidak menambahkan Link baru.
4. IF pengguna mengonfirmasi penambahan Link dengan URL yang tidak diawali `http://` atau `https://`, THEN THE Quick_Links SHALL menampilkan pesan kesalahan yang mengindikasikan format URL tidak valid dan tidak menambahkan Link baru.
5. IF pengguna mengonfirmasi penambahan Link dengan URL yang identik dengan URL Link yang sudah ada dalam daftar, THEN THE Quick_Links SHALL menampilkan pesan kesalahan yang mengindikasikan URL sudah terdaftar dan tidak menambahkan Link baru.
6. IF pengguna mengonfirmasi penambahan Link saat jumlah Link dalam daftar sudah mencapai 50, THEN THE Quick_Links SHALL menampilkan pesan kesalahan yang mengindikasikan daftar sudah penuh dan tidak menambahkan Link baru.
7. WHEN pengguna mengeklik sebuah Link, THE Quick_Links SHALL membuka URL tujuan Link tersebut di tab browser baru.
8. WHEN pengguna mengeklik tombol hapus pada sebuah Link, THE Quick_Links SHALL menghilangkan Link tersebut dari daftar dan memperbarui data di Local_Storage tanpa memerlukan konfirmasi tambahan.
9. WHEN pengguna menambah atau menghapus sebuah Link, THE Quick_Links SHALL menyimpan seluruh data Link ke Local_Storage.
10. WHEN halaman Dashboard dimuat, THE Quick_Links SHALL memuat dan menampilkan data Link yang tersimpan di Local_Storage.
11. IF tidak ada data Link di Local_Storage saat halaman dimuat, THEN THE Quick_Links SHALL menampilkan daftar kosong tanpa pesan kesalahan.

---

### Requirement 5: Tata Letak dan Responsivitas Dashboard

**User Story:** Sebagai pengguna, saya ingin tampilan Dashboard yang tertata rapi dan dapat digunakan di berbagai ukuran layar, sehingga saya dapat mengakses dasbor dengan nyaman baik dari desktop maupun perangkat lain.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan semua komponen (Clock, Task_List, Focus_Timer, Quick_Links) dalam satu halaman tanpa memerlukan navigasi ke halaman lain.
2. THE Dashboard SHALL menggunakan tata letak grid atau flexbox sehingga semua komponen tampil tanpa terpotong (no clipping) dan tanpa overflow horizontal pada resolusi minimal 1024 x 768 piksel.
3. WHEN lebar layar kurang dari 768 piksel, THE Dashboard SHALL menyusun ulang komponen secara vertikal sehingga setiap komponen menggunakan lebar 100% dari lebar viewport dan tidak terdapat overflow horizontal.
4. WHEN lebar layar berada di antara 768 piksel dan 1023 piksel, THE Dashboard SHALL menampilkan komponen dalam tata letak dua kolom di mana setiap kolom memiliki lebar minimal 45% dari lebar viewport.
5. THE Dashboard SHALL dapat dijalankan langsung di browser Chrome 120+, Firefox 120+, atau Edge 120+ tanpa memerlukan server backend atau proses build.

---

### Requirement 6: Mode Terang/Gelap (Light/Dark Mode)

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara mode terang dan mode gelap, sehingga saya dapat menyesuaikan tampilan Dashboard dengan preferensi visual saya dan kondisi pencahayaan sekitar.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan kontrol toggle yang memungkinkan pengguna beralih antara Light Mode dan DarkMode.
2. WHEN pengguna mengaktifkan DarkMode melalui kontrol toggle, THE Dashboard SHALL menerapkan skema warna gelap pada seluruh komponen Dashboard secara langsung tanpa memuat ulang halaman.
3. WHEN pengguna menonaktifkan DarkMode melalui kontrol toggle, THE Dashboard SHALL menerapkan skema warna terang pada seluruh komponen Dashboard secara langsung tanpa memuat ulang halaman.
4. WHEN pengguna mengubah preferensi DarkMode, THE Dashboard SHALL menyimpan preferensi tersebut ke Local_Storage.
5. WHEN halaman Dashboard dimuat dan Local_Storage menyimpan preferensi DarkMode aktif, THE Dashboard SHALL menerapkan DarkMode sebelum komponen lain dirender sehingga tidak terjadi kedipan (flash) dari mode terang ke gelap.
6. WHEN halaman Dashboard dimuat dan tidak ada preferensi DarkMode di Local_Storage, THE Dashboard SHALL menerapkan Light Mode sebagai tampilan default.
7. THE Dashboard SHALL menampilkan label atau ikon yang jelas pada kontrol toggle untuk membedakan keadaan aktif DarkMode dan Light Mode.
