# Sistem Parkir API

API lengkap untuk mengelola sistem parkir kendaraan menggunakan NestJS dan Prisma dengan fitur CRUD, search, filter, pagination, dan laporan pendapatan.

## 🚀 Fitur Utama

- ✅ **CRUD Operations**: Create, Read, Update, Delete data parkir
- ✅ **Auto Calculation**: Perhitungan tarif parkir otomatis berdasarkan jenis kendaraan dan durasi
- ✅ **Advanced Search & Filter**: Pencarian berdasarkan plat nomor dan filter jenis kendaraan
- ✅ **Pagination**: Sistem pagination untuk performa optimal
- ✅ **Revenue Reports**: Laporan pendapatan total, harian, dan berdasarkan tanggal
- ✅ **Input Validation**: Validasi lengkap menggunakan class-validator
- ✅ **Error Handling**: Penanganan error yang konsisten dengan try-catch blocks
- ✅ **TypeScript**: Type safety penuh dengan TypeScript
- ✅ **Prisma ORM**: Database management yang type-safe

## 🛠️ Teknologi yang Digunakan

- **Framework**: NestJS (Node.js enterprise framework)
- **Database**: MySQL dengan Prisma ORM
- **Validation**: class-validator & class-transformer
- **Language**: TypeScript
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js versi 16 atau lebih baru
- MySQL Server
- npm atau yarn

## 🚀 Instalasi dan Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd case-study-sistem-parkir-AbdullohH12Y4M
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
- Pastikan MySQL server berjalan
- Buat database baru (contoh: `sistem_parkir`)
- Buat file `.env` di root directory:
```env
DATABASE_URL="mysql://username:password@localhost:3306/sistem_parkir"
```

### 4. Database Migration
```bash
npx prisma migrate dev
```

### 5. Jalankan Aplikasi
```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🗄️ Struktur Database

```prisma
enum jenisKendaraan {
  RODA2  // Motor
  RODA4  // Mobil
}

model Parkir {
  id               Int            @id @default(autoincrement())
  platNomor        String
  jenisKendaraan   jenisKendaraan
  durasi           Int            // dalam jam
  total            Int            // dalam rupiah
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}
```

## 💰 Perhitungan Tarif Parkir

### Motor (RODA2):
- 1 jam pertama: Rp 3.000
- Setiap jam berikutnya: Rp 2.000

### Mobil (RODA4):
- 1 jam pertama: Rp 6.000
- Setiap jam berikutnya: Rp 4.000

### Rumus Perhitungan:
```
Jika durasi = 1 jam:
  total = tarif_jam_pertama

Jika durasi > 1 jam:
  total = tarif_jam_pertama + (durasi - 1) × tarif_per_jam_berikutnya
```

### Contoh:
- Motor 3 jam: 3000 + (2 × 2000) = 7.000
- Mobil 2 jam: 6000 + (1 × 4000) = 10.000

## 📡 API Endpoints

### 1. POST /parkir - Tambah Data Parkir

**Deskripsi**: Menambah data parkir baru dengan perhitungan tarif otomatis.

**Request Body**:
```json
{
  "platNomor": "B1234XYZ",
  "jenisKendaraan": "RODA2",
  "durasi": 3
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "platNomor": "B1234XYZ",
  "jenisKendaraan": "RODA2",
  "durasi": 3,
  "total": 7000,
  "createdAt": "2024-11-20T10:00:00.000Z",
  "updatedAt": "2024-11-20T10:00:00.000Z"
}
```

### 2. GET /parkir - Ambil Semua Data Parkir

**Deskripsi**: Mengambil semua data parkir dengan fitur search, filter, dan pagination.

**Query Parameters** (opsional):
- `platNomor`: Search berdasarkan plat nomor (contains, case-insensitive)
- `jenisKendaraan`: Filter berdasarkan jenis kendaraan (RODA2/RODA4)
- `page`: Nomor halaman (default: 1)
- `limit`: Jumlah data per halaman (default: 10, max: 100)

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "platNomor": "B1234XYZ",
      "jenisKendaraan": "RODA2",
      "durasi": 3,
      "total": 7000,
      "createdAt": "2024-11-20T10:00:00.000Z",
      "updatedAt": "2024-11-20T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Contoh Penggunaan**:
- Semua data: `GET /parkir`
- Search: `GET /parkir?platNomor=B1234`
- Filter: `GET /parkir?jenisKendaraan=RODA2`
- Pagination: `GET /parkir?page=2&limit=5`
- Kombinasi: `GET /parkir?platNomor=B&jenisKendaraan=RODA4&page=1&limit=10`

### 3. GET /parkir/:id - Detail Parkir

**Deskripsi**: Mengambil detail data parkir berdasarkan ID.

**Response (200 OK)**:
```json
{
  "id": 1,
  "platNomor": "B1234XYZ",
  "jenisKendaraan": "RODA2",
  "durasi": 3,
  "total": 7000,
  "createdAt": "2024-11-20T10:00:00.000Z",
  "updatedAt": "2024-11-20T10:00:00.000Z"
}
```

**Error Response (404 Not Found)**:
```json
{
  "statusCode": 404,
  "message": "Data parkir dengan ID 999 tidak ditemukan"
}
```

### 4. PATCH /parkir/:id - Update Durasi Parkir

**Deskripsi**: Mengubah durasi parkir (total akan dihitung ulang otomatis).

**Request Body**:
```json
{
  "durasi": 5
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "platNomor": "B1234XYZ",
  "jenisKendaraan": "RODA2",
  "durasi": 5,
  "total": 11000,
  "createdAt": "2024-11-20T10:00:00.000Z",
  "updatedAt": "2024-11-20T11:00:00.000Z"
}
```

### 5. DELETE /parkir/:id - Hapus Data Parkir

**Deskripsi**: Menghapus data parkir berdasarkan ID.

**Response (200 OK)**:
```json
{
  "message": "Data parkir dengan ID 1 berhasil dihapus"
}
```

### 6. GET /parkir/total - Total Pendapatan Keseluruhan

**Deskripsi**: Menghitung total pendapatan dari semua data parkir.

**Response (200 OK)**:
```json
{
  "total_pendapatan": 25000,
  "jumlah_transaksi": 5
}
```

### 7. GET /parkir/pendapatan/hari-ini - Pendapatan Hari Ini

**Deskripsi**: Menghitung total pendapatan hari ini (berdasarkan createdAt).

**Response (200 OK)**:
```json
{
  "tanggal": "2024-11-20",
  "total_pendapatan": 15000,
  "jumlah_transaksi": 3
}
```

### 8. GET /parkir/pendapatan/tanggal/:tanggal - Pendapatan Berdasarkan Tanggal

**Deskripsi**: Menghitung total pendapatan pada tanggal tertentu.

**Parameter**: `tanggal` (format: YYYY-MM-DD, contoh: 2024-11-20)

**Response (200 OK)**:
```json
{
  "tanggal": "2024-11-20",
  "total_pendapatan": 15000,
  "jumlah_transaksi": 3
}
```

**Error Response (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Format tanggal tidak valid. Gunakan format YYYY-MM-DD (contoh: 2024-11-20)"
}
```

## ⚠️ Error Handling

Semua endpoint menggunakan penanganan error yang konsisten dengan try-catch blocks dan mengembalikan response error standar:

```json
{
  "statusCode": 400,
  "message": "Terjadi kesalahan saat mengambil data parkir",
  "error": "Bad Request"
}
```

**Kode Error Umum**:
- `400 Bad Request`: Validasi input gagal atau parameter tidak valid
- `404 Not Found`: Data tidak ditemukan
- `500 Internal Server Error`: Error server internal

## ✅ Validation Rules

- `platNomor`: String tidak kosong, maksimal 20 karakter
- `jenisKendaraan`: Enum yang valid (RODA2 atau RODA4)
- `durasi`: Integer positif, minimum 1
- `tanggal`: String format YYYY-MM-DD untuk endpoint pendapatan
- `page`: Integer positif untuk pagination
- `limit`: Integer 1-100 untuk pagination

## 🧪 Testing dengan Postman

### Setup Postman:
1. **Import Collection**: Import file Postman collection (jika tersedia)
2. **Setup Environment**:
   - Variable: `base_url` = `http://localhost:3000`
3. **Jalankan Aplikasi**:
   ```bash
   npm run start:dev
   ```

### Contoh Request di Postman:

**Create Parkir**:
- Method: POST
- URL: `{{base_url}}/parkir`
- Headers: `Content-Type: application/json`
- Body:
  ```json
  {
    "platNomor": "B1234XYZ",
    "jenisKendaraan": "RODA2",
    "durasi": 2
  }
  ```

**Get All dengan Filter**:
- Method: GET
- URL: `{{base_url}}/parkir?jenisKendaraan=RODA2&page=1&limit=5`

## 📜 Scripts NPM

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "build": "nest build",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json"
}
```

## 🏗️ Struktur Project

```
src/
├── app.controller.ts      # Root controller
├── app.module.ts          # Root module
├── app.service.ts         # Root service
├── main.ts                # Application entry point
├── parkir/                # Parkir module
│   ├── dto/               # Data Transfer Objects
│   │   ├── create-parkir.dto.ts
│   │   ├── update-parkir.dto.ts
│   │   └── query-parkir.dto.ts
│   ├── entities/          # Database entities
│   │   └── parkir.entity.ts
│   ├── parkir.controller.ts
│   ├── parkir.module.ts
│   ├── parkir.service.ts   # Service dengan try-catch error handling
│   └── parkir.spec.ts
└── prisma/                # Database module
    ├── prisma.module.ts
    └── prisma.service.ts
```

## 🔧 Development Guidelines

### Code Style
- Menggunakan ESLint dan Prettier
- Follow NestJS best practices
- TypeScript strict mode enabled
- Consistent naming conventions (camelCase untuk methods, PascalCase untuk classes)

### Error Handling Pattern
```typescript
async methodName(params: any) {
  try {
    // business logic
    return result;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Error message', error.message);
  }
}
```

## 🐛 Troubleshooting

### Database Connection Error
```
PrismaClientInitializationError: Can't reach database server at `localhost:3306`
```
**Solusi**:
1. Pastikan MySQL server berjalan
2. Periksa DATABASE_URL di file `.env`
3. Jalankan `npx prisma generate` jika schema berubah

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solusi**:
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Build Error
```bash
npm run build
```
Pastikan semua dependencies terinstall dan TypeScript errors sudah diperbaiki.

## 🤝 Contributing

1. Fork repository ini
2. Buat branch fitur baru: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'Add some feature'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

### Commit Message Convention
- `feat:` untuk fitur baru
- `fix:` untuk perbaikan bug
- `docs:` untuk dokumentasi
- `style:` untuk formatting
- `refactor:` untuk refactoring code
- `test:` untuk testing
- `chore:` untuk maintenance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Dibuat dengan ❤️ menggunakan NestJS & Prisma**
