# Personal Finance Dashboard

Aplikasi web dashboard keuangan pribadi (local-first, single-user) berbasis **NestJS** + **Vue 3** + **TypeScript** + **Prisma ORM (SQLite)** + **Bootstrap 5**.

---

## 1. Prasyarat & Versi

- **Node.js**: v18+ (Diverifikasi berjalan stabil pada Node.js v26.13.0 LTS)
- **npm**: v9+ (Diverifikasi dengan npm v11.20.0)
- **Database**: SQLite (terintegrasi langsung melalui Prisma ORM, tidak memerlukan database server eksternal)

---

## 2. Struktur Proyek

```text
Touring/
├── backend/                       # REST API Backend (NestJS + Prisma 6 + SQLite)
│   ├── prisma/
│   │   ├── schema.prisma          # Definisi model Category, Transaction, Budget
│   │   ├── migrations/            # Riwayat migrasi SQLite
│   │   ├── seed.ts                # Idempotent seed script
│   │   └── dev.db                 # Database SQLite lokal
│   ├── src/
│   │   ├── common/                # Utility tanggal & boundary interval
│   │   ├── prisma/                # PrismaModule & PrismaService
│   │   ├── categories/            # Modul kategori (CRUD + validasi integritas)
│   │   ├── transactions/          # Modul transaksi (CRUD + filter)
│   │   ├── budgets/               # Modul anggaran bulanan (Upsert + utilisasi)
│   │   ├── dashboard/             # Modul ringkasan, breakdown, & tren 6 bulan
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
├── frontend/                      # Web Client (Vue 3 + Vite + TypeScript + Bootstrap 5)
│   ├── src/
│   │   ├── api/                   # Centralized Axios client & services
│   │   ├── components/            # Komponen Navbar, Alert, dll.
│   │   ├── router/                # Vue Router 4 (Dashboard, Transaksi, Kategori, Anggaran)
│   │   ├── views/                 # DashboardView, TransactionsView, CategoriesView, BudgetsView
│   │   ├── types/                 # Definisi tipe TypeScript API
│   │   ├── utils/                 # Currency formatter (IDR), Date helper
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── .env.example
│   ├── .env
│   └── package.json
├── .gitignore
└── README.md
```

---

## 3. Instalasi dan Setup Awal

### Langkah 1: Setup Backend

Buka terminal di folder `backend`:

```bash
cd backend

# 1. Salin konfigurasi environment
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Jalankan migrasi database
npm run db:migrate

# 5. Jalankan seed data awal (idempoten)
npm run db:seed
```

### Langkah 2: Setup Frontend

Buka terminal di folder `frontend`:

```bash
cd frontend

# 1. Salin konfigurasi environment
cp .env.example .env

# 2. Install dependencies
npm install
```

---

## 4. Konfigurasi Environment Variable

### Backend (`backend/.env`)
```env
PORT=3000
DATABASE_URL="file:./dev.db"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

---

## 5. Cara Menjalankan Aplikasi

Jalankan backend dan frontend di dua terminal terpisah:

### Terminal 1 — Backend
```bash
cd backend
npm run start:dev
# Atau untuk production build:
# npm run build && npm run start:prod
```
> Server backend berjalan di: **`http://localhost:3000/api/v1`**

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```
> Aplikasi web berjalan di: **`http://localhost:5173/`**

---

## 6. URL Lokal Aplikasi

| Aplikasi | URL Lokal | Deskripsi |
|---|---|---|
| **Frontend Web App** | [http://localhost:5173/](http://localhost:5173/) | Halaman UI Dashboard Utama |
| **Backend API Root** | [http://localhost:3000/api/v1](http://localhost:3000/api/v1) | Endpoint Dasar REST API |

---

## 7. Ringkasan Endpoint REST API (`/api/v1`)

### Kategori (`/categories`)
- `GET /api/v1/categories` — Menampilkan seluruh kategori (opsional filter query `?type=INCOME|EXPENSE`).
- `GET /api/v1/categories/:id` — Detail kategori spesifik.
- `POST /api/v1/categories` — Menambah kategori baru (`name`, `type`, `color`). Mencegah nama duplikat pada tipe yang sama (409 Conflict).
- `PATCH /api/v1/categories/:id` — Memperbarui nama atau warna kategori.
- `DELETE /api/v1/categories/:id` — Menolak penghapusan (400 Bad Request) jika kategori masih digunakan oleh transaksi atau anggaran demi menjaga integritas riwayat keuangan.

### Transaksi (`/transactions`)
- `GET /api/v1/transactions` — Mengambil daftar transaksi dengan opsi filter `month` (YYYY-MM), `type` (INCOME/EXPENSE), `categoryId`, serta rentang tanggal `from` dan `to`.
- `GET /api/v1/transactions/:id` — Detail transaksi.
- `POST /api/v1/transactions` — Menambah transaksi baru. Memvalidasi bahwa nominal bernilai positif dan tipe transaksi selaras dengan tipe kategori.
- `PATCH /api/v1/transactions/:id` — Mengedit transaksi.
- `DELETE /api/v1/transactions/:id` — Menghapus transaksi.

### Anggaran (`/budgets`)
- `GET /api/v1/budgets?month=YYYY-MM` — Mengambil daftar anggaran bulan terpilih beserta realisasi pengeluaran (`spentAmount`), sisa anggaran (`remainingAmount`), dan persentase utilisasi (`usagePercentage`).
- `PUT /api/v1/budgets` — Menetapkan atau memperbarui batas anggaran per kategori dan bulan (Upsert). Hanya kategori `EXPENSE` yang dapat memiliki anggaran.
- `DELETE /api/v1/budgets/:id` — Menghapus data anggaran.

### Dashboard (`/dashboard`)
- `GET /api/v1/dashboard/summary?month=YYYY-MM` — Total pemasukan, total pengeluaran, arus kas bersih (net cash flow), dan jumlah transaksi bulan terpilih.
- `GET /api/v1/dashboard/category-breakdown?month=YYYY-MM` — Distribusi pengeluaran per kategori terurut dari yang terbesar.
- `GET /api/v1/dashboard/monthly-trend?months=6` — Data perbandingan pemasukan dan pengeluaran 6 bulan terakhir.

---

## 8. Reset & Reseed Database

Jika Anda ingin mereset database ke kondisi awal demo:

```bash
cd backend

# Hapus database SQLite dev.db dan jalankan migrasi ulang + seed otomatis:
npx prisma migrate reset --force

# Atau jalankan seed secara manual (idempoten):
npm run db:seed
```

Data seed menyediakan:
- **Kategori Bawaan**: Gaji, Bonus, Penghasilan Lain (INCOME); Makanan, Transportasi, Tempat Tinggal, Tagihan, Keluarga, Langganan, Kesehatan, Lain-lain (EXPENSE).
- **Demo Transaksi**: Transaksi contoh bulan Oktober dan November 2026.
- **Demo Anggaran**: Alokasi anggaran bulanan untuk pengeluaran rutin.

---

## 9. Panduan Troubleshooting

1. **Port Konflik (Port 3000 / 5173 telah digunakan)**:
   - Ganti `PORT` di `backend/.env` (misal: `PORT=3001`).
   - Sesuaikan `VITE_API_BASE_URL` di `frontend/.env` ke port baru tersebut.
   - Jika Vite menggunakan port selain 5173, periksa output terminal Vite dan sesuaikan `CORS_ORIGIN` di `backend/.env`.

2. **Prisma Client Generation Error**:
   - Jalankan `npm run prisma:generate` di folder `backend`.
   - Pastikan versi `prisma` dan `@prisma/client` konsisten.

3. **PowerShell Script Execution Policy Error (`npm.ps1 cannot be loaded`)**:
   - Gunakan `npm.cmd` atau jalankan PowerShell dengan hak eksekusi script: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

4. **CORS Error**:
   - Pastikan origin frontend (`http://localhost:5173`) tercantum pada `backend/src/main.ts` dan variabel `CORS_ORIGIN` di `backend/.env`.

---

## 10. Status Verifikasi & Build

- **Backend Typecheck & Build**: Lolos tanpa error (`nest build`).
- **Frontend Typecheck & Build**: Lolos tanpa error (`vue-tsc -b && vite build`).
- **Database Migrations & Seed**: Terverifikasi berhasil dan idempoten.
- **API Smoke Tests**:
  - `GET /api/v1/categories` (200 OK)
  - `GET /api/v1/dashboard/summary` (200 OK, perhitungan matematis akurat)
  - `GET /api/v1/dashboard/category-breakdown` (200 OK)
  - `GET /api/v1/dashboard/monthly-trend` (200 OK)
  - `GET /api/v1/budgets` (200 OK)
  - `POST /api/v1/transactions` (201 Created)
  - `PATCH /api/v1/transactions/:id` (200 OK)
  - `DELETE /api/v1/transactions/:id` (200 OK)
  - Validasi penolakan penghapusan kategori terkait (400 Bad Request)
  - Validasi pencegahan nama kategori duplikat (409 Conflict)
  - Validasi pencegahan anggaran untuk kategori pendapatan (400 Bad Request)
