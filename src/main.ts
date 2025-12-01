// src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * BOOTSTRAP FUNCTION
 * Entry point aplikasi NestJS
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * ENABLE GLOBAL VALIDATION PIPE
   * Sesuai requirement PDF: "Validasi"
   * 
   * Fitur:
   * - Validasi otomatis semua request berdasarkan DTO
   * - Hapus properti yang tidak ada di DTO (whitelist)
   * - Throw error jika ada properti tidak dikenal (forbidNonWhitelisted)
   * - Transform payload ke DTO instances (transform)
   * - Convert string ke number otomatis (enableImplicitConversion)
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hapus properti yang tidak ada di DTO
      forbidNonWhitelisted: true, // Throw error jika ada properti tidak dikenal
      transform: true, // Auto-transform payloads ke DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert string ke number otomatis
      },
    }),
  );

  /**
   * ENABLE CORS
   * Untuk mengizinkan request dari domain lain (jika diperlukan)
   */
  app.enableCors();

  /**
   * LISTEN TO PORT
   * Default: 3000 atau dari environment variable PORT
   */
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  /**
   * LOG INFORMASI APLIKASI
   */
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🚗 API PENGELOLAAN PARKIR KENDARAAN                      ║
║                                                           ║
║  ✅ Aplikasi berhasil berjalan!                           ║
║  📍 URL: http://localhost:${port}                           ║
║                                                           ║
║  📚 Endpoints yang tersedia:                              ║
║     • POST   /parkir                → Tambah data        ║
║     • GET    /parkir                → Ambil semua data   ║
║     • GET    /parkir/total          → Total pendapatan   ║
║     • GET    /parkir/pendapatan/hari-ini                 ║
║                                     → Pendapatan hari ini║
║     • GET    /parkir/pendapatan/tanggal/:tanggal         ║
║                                     → Pendapatan tanggal ║
║     • GET    /parkir/:id            → Detail parkir      ║
║     • PATCH  /parkir/:id            → Update durasi      ║
║     • DELETE /parkir/:id            → Hapus data         ║
║                                                           ║
║  💡 Fitur:                                                ║
║     ✓ Search by plat nomor                               ║
║     ✓ Filter by jenis kendaraan                          ║
║     ✓ Pagination                                         ║
║     ✓ Auto-calculate tarif                               ║
║     ✓ Validasi lengkap                                   ║
║     ✓ Pendapatan per tanggal                             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
