# Visual Novel RPG

Engine visual novel berbasis web yang berjalan sepenuhnya di sisi klien (tanpa backend). Semua dialog in-game ditulis dalam Bahasa Indonesia.

## Menjalankan secara lokal
1. Jalankan server statis:
   ```bash
   python -m http.server 8000
   ```
2. Buka di browser:
   ```
   http://127.0.0.1:8000/index.html
   ```

## Menjalankan di GitHub Pages
1. Buka **Settings → Pages** pada repository ini.
2. Pilih **Deploy from a branch**, lalu pilih branch dan root (`/`).
3. Simpan konfigurasi. GitHub Pages akan meng-host `index.html`.

Loader scene menggunakan URL berbasis modul sehingga aman untuk subpath GitHub Pages dan tetap memiliki fallback embedded scenes bila `data/scenes.json` gagal dimuat.
