# RAFIKOSAN lemillion project — Photobooth

A vintage airmail-themed photobooth web application built with Nuxt 3, Supabase, and Tailwind CSS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (tested on v24.15.0)
- A [Supabase](https://supabase.com) project

### 1. Clone & Install
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and fill in your Supabase credentials:
- `SUPABASE_URL` — from Supabase Dashboard → Settings → API
- `SUPABASE_KEY` — `anon` public key
- `SUPABASE_SERVICE_KEY` — `service_role` key (server-side only)

### 3. Set up Supabase Database
In your Supabase project, go to **SQL Editor** and run in order:

```
1. supabase/schema.sql   — creates all tables, enums, policies, indexes
2. supabase/storage.sql  — creates the photos storage bucket
3. supabase/seed.sql     — creates default admin account
```

### 4. Start Development
```bash
npm run dev
```

App runs at: **http://localhost:3000**

---

## 🔑 Default Admin Credentials

| Field    | Value          |
|----------|----------------|
| URL      | `/admin/login` |
| Username | `admin`        |
| Password | `lemillion2024` |

⚠️ **Change the password in production!** See `supabase/seed.sql` for how to generate a bcrypt hash.

---

## 📱 User Flow

```
/ (Auth/Pay)
  ↓ QRIS payment or access code
/prep (Session info)
  ↓ Click "MULAI PHOTO"
/camera (10-min camera session with 3-2-1 countdown)
  ↓ After 6+ photos → "Lanjut ke Sesi Frame"
  ↓ OR timer expires → Timeout modal
    → /ekstensi (pay for +5 min) OR skip to frame
/select-photos (choose exactly 6 photos)
  ↓
/select-layout (choose Portrait 2×3 or Landscape 3×2 frame)
  ↓
/arrange (drag & drop 6 photos into frame slots)
  ↓ "Cetak Photo"
/result (QR code + print + end session)
```

---

## 🛡️ Admin Panel

All admin routes are protected by the `admin-auth` middleware.

| Route             | Purpose                        |
|-------------------|--------------------------------|
| `/admin`          | Dashboard with today's stats   |
| `/admin/pengaturan` | Update QRIS prices           |
| `/admin/kode`     | Generate & manage access codes |
| `/admin/sesi`     | View all sessions & photos     |
| `/admin/frame`    | Manage frame templates         |

---

## 🖼️ Frame Templates

Place your transparent PNG frame overlays in `/public/frames/`:
- `portrait-2x3.png` — 2 columns × 3 rows
- `landscape-3x2.png` — 3 columns × 2 rows

The frames should be transparent PNGs with a vintage airmail border (red/blue/white stripes) and decorative stamp vectors. The photo slots should be transparent rectangular areas the app will fill.

---

## 🗄️ Database Schema

| Table          | Purpose                              |
|----------------|--------------------------------------|
| `pengaturan`   | Dynamic settings (prices)            |
| `admin`        | Admin accounts                       |
| `kode_akses`   | Access codes (utama/ekstensi)        |
| `sesi`         | Photo sessions                       |
| `transaksi`    | Payment records per session          |
| `foto`         | Individual photos per session        |
| `master_frame` | Frame templates                      |
| `hasil_frame`  | Completed frame per session          |
| `foto_terpilih`| Which photos go in which frame slot  |

---

## 🔧 Tech Stack

- **Framework:** Nuxt 3 (Vue 3, Composition API, `<script setup>`)
- **Backend:** Supabase (PostgreSQL + Storage + RLS)
- **Styling:** Tailwind CSS v3
- **State:** Pinia
- **QR Code:** `qrcode` npm package
- **Fonts:** Special Elite · Playfair Display · Courier Prime

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

---

## 🎨 Customization

### Prices
Update via Admin → Pengaturan, or directly in `supabase/schema.sql`:
```sql
INSERT INTO pengaturan (kunci_pengaturan, nilai) VALUES
  ('harga_utama',    '17000'),
  ('harga_ekstensi', '7000');
```

### QRIS Image
Replace the placeholder QR block in `pages/index.vue` with your actual QRIS image:
```html
<img src="/your-qris.png" alt="QRIS Payment" class="w-48 h-48" />
```

### Colors / Theme
Edit `tailwind.config.js` → `theme.extend.colors.airmail` to adjust the palette.

---

## 📄 License

MIT — RAFIKOSAN lemillion project
