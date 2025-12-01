// src/parkir/parkir.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParkirDto } from './dto/create-parkir.dto';
import { UpdateParkirDto } from './dto/update-parkir.dto';
import { paginationParkirDto } from './dto/query-parkir.dto';
import { jenisKendaraan } from '@prisma/client';

@Injectable()
export class ParkirService {
  constructor(private prisma: PrismaService) {}

  /**
   * PERHITUNGAN TARIF PARKIR
   * Sesuai requirement PDF:
   * 
   * RODA 2 (Motor):
   * - 1 jam pertama: Rp 3.000
   * - Setiap jam berikutnya: Rp 2.000
   * 
   * RODA 4 (Mobil):
   * - 1 jam pertama: Rp 6.000
   * - Setiap jam berikutnya: Rp 4.000
   * 
   * Formula:
   * - Jika durasi = 1: total = tarif jam pertama
   * - Jika durasi > 1: total = tarif jam pertama + (durasi - 1) × tarif per jam berikutnya
   * 
   */
  private hitungTotal(jenisKendaraan: jenisKendaraan, durasi: number): number {
    try {
      let tarifPertama: number;
      let tarifBerikutnya: number;

      if (jenisKendaraan === 'RODA2') {
        tarifPertama = 3000; // Rp 3.000 untuk jam pertama
        tarifBerikutnya = 2000; // Rp 2.000 untuk jam berikutnya
      } else if (jenisKendaraan === 'RODA4') {
        // RODA4
        tarifPertama = 6000; // Rp 6.000 untuk jam pertama
        tarifBerikutnya = 4000; // Rp 4.000 untuk jam berikutnya
      } else {
        throw new BadRequestException('Jenis kendaraan tidak valid');
      }

      if (durasi <= 0 || !Number.isInteger(durasi)) {
        throw new BadRequestException('Durasi harus berupa bilangan bulat positif');
      }

      // Jika durasi hanya 1 jam
      if (durasi === 1) {
        return tarifPertama;
      }

      // Jika durasi lebih dari 1 jam
      return tarifPertama + (durasi - 1) * tarifBerikutnya;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Terjadi kesalahan dalam perhitungan tarif parkir ', error.message);
    }
  }

  /**
   * POST /parkir
   * Requirement PDF: Tambah data parkir
   * - Input: platNomor, jenisKendaraan, durasi
   * - Output: Data parkir dengan total yang sudah dihitung otomatis
   */
  async create(createParkirDto: CreateParkirDto) {
    try {
      // Hitung total berdasarkan jenis kendaraan dan durasi
      const total = this.hitungTotal(
        createParkirDto.jenisKendaraan as jenisKendaraan,
        createParkirDto.durasi,
      );

      // Simpan ke database
      const parkir = await this.prisma.parkir.create({
        data: {
          platNomor: createParkirDto.platNomor,
          jenisKendaraan: createParkirDto.jenisKendaraan as jenisKendaraan,
          durasi: createParkirDto.durasi,
          total,
        },
      });

      return parkir;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Terjadi kesalahan saat membuat data parkir', error.message);
    }
  }

  /**
   * GET /parkir
   * Requirement PDF: Ambil semua data parkir
   * Bonus: Search, Filter, Pagination
   *
   * Fitur:
   * 1. SEARCH: Cari berdasarkan plat nomor (contains)
   * 2. FILTER: Filter berdasarkan jenis kendaraan (exact match)
   * 3. PAGINATION: Batasi jumlah data per halaman
   *
   * Contoh penggunaan:
   * - GET /parkir
   * - GET /parkir?platNomor=B1234
   * - GET /parkir?jenisKendaraan=RODA2
   * - GET /parkir?page=2&limit=5
   * - GET /parkir?platNomor=B&jenisKendaraan=RODA4&page=1&limit=10
   */
  async findAll(query: paginationParkirDto) {
    try {
    const { platNomor, jenisKendaraan, page = 1, limit = 10 } = query;

    // Build WHERE condition untuk filtering dan search
    const whereCondition: any = {};

    // SEARCH: Cari berdasarkan plat nomor (contains - case insensitive)
    if (platNomor) {
      whereCondition.platNomor = {
        contains: platNomor,
      };
    }

    // FILTER: Filter berdasarkan jenis kendaraan
    if (jenisKendaraan) {
      whereCondition.jenisKendaraan = jenisKendaraan;
    }

    // Execute query dengan pagination
    // Promise.all untuk efisiensi - query data dan count bersamaan
    const [data, total] = await Promise.all([
      // Ambil data dengan pagination
      this.prisma.parkir.findMany({
        where: whereCondition,
        skip: (page - 1) * limit, // Offset untuk pagination
        take: limit, // Limit jumlah data
        orderBy: {
          createdAt: 'desc', // Urutkan dari yang terbaru (histori)
        },
      }),
      // Hitung total data untuk metadata pagination
      this.prisma.parkir.count({
        where: whereCondition,
      }),
    ]);

    // Return dengan metadata pagination
    return {
      data,
      meta: {
        total, // Total semua data
        page, // Halaman saat ini
        limit, // Jumlah data per halaman
        totalPages: Math.ceil(total / limit), // Total halaman
      },
    };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Terjadi kesalahan saat mengambil data parkir', error.message);
    }
  }

  /**
   * GET /parkir/:id
   * Requirement PDF: Ambil detail parkir berdasarkan ID
   */
  async findOne(id: number) {
    const parkir = await this.prisma.parkir.findUnique({
      where: { id },
    });

    if (!parkir) {
      throw new NotFoundException(
        `Data parkir dengan ID ${id} tidak ditemukan`,
      );
    }

    return parkir;
  }

  /**
   * GET /parkir/total
   * Requirement PDF: Hitung total pendapatan dari semua data parkir
   *
   * Menggunakan manual calculation sebagai fallback jika aggregate gagal
   * Output: { total_pendapatan, jumlah_transaksi }
   */
  async getTotalPendapatan() {
    try {
      // Coba gunakan aggregate terlebih dahulu
      try {
        const result = await this.prisma.parkir.aggregate({
          _sum: {
            total: true, // Sum semua kolom total
          },
          _count: {
            id: true, // Count semua records
          },
        });

        return {
          total_pendapatan: result._sum.total || 0,
          jumlah_transaksi: result._count.id || 0,
        };
      } catch (aggregateError) {
        // Jika aggregate gagal, gunakan manual calculation
        console.warn('Aggregate query failed, using manual calculation:', aggregateError.message);

        const allRecords = await this.prisma.parkir.findMany({
          select: {
            total: true,
          },
        });

        const totalPendapatan = allRecords.reduce((sum, record) => sum + record.total, 0);
        const jumlahTransaksi = allRecords.length;

        return {
          total_pendapatan: totalPendapatan,
          jumlah_transaksi: jumlahTransaksi,
        };
      }
    } catch (error) {
      throw new BadRequestException('Terjadi kesalahan saat mengambil total pendapatan', error.message);
    }
  }

  /**
   * PATCH /parkir/:id
   * Requirement BONUS PDF: Ubah durasi parkir
   * - Total akan dihitung ulang otomatis
   */
  async update(id: number, updateParkirDto: UpdateParkirDto) {
    // Cek apakah data parkir ada
    const parkir = await this.findOne(id);

    // Jika durasi diubah, hitung ulang total
    if (updateParkirDto.durasi) {
      const total = this.hitungTotal(
        parkir.jenisKendaraan,
        updateParkirDto.durasi,
      );

      // Update database dengan durasi dan total baru
      return await this.prisma.parkir.update({
        where: { id },
        data: {
          durasi: updateParkirDto.durasi,
          total,
        },
      });
    }

    return parkir;
  }

  /**
   * DELETE /parkir/:id
   * Requirement BONUS PDF: Hapus data parkir
   */
  async remove(id: number) {
    // Cek apakah data parkir ada (akan throw NotFoundException jika tidak ada)
    await this.findOne(id);

    // Hapus data dari database
    await this.prisma.parkir.delete({
      where: { id },
    });

    return {
      message: `Data parkir dengan ID ${id} berhasil dihapus`,
    };
  }

  /**
   * GET /parkir/pendapatan/hari-ini
   * Menghitung total pendapatan hari ini (today)
   *
   * Output:
   * {
   *   "tanggal": "2024-11-20",
   *   "total_pendapatan": 50000,
   *   "jumlah_transaksi": 10
   * }
   */
  async getPendapatanHariIni() {
    try {
      // Get start and end of today in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day: 00:00:00

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // End of day: next day 00:00:00

      // Query data parkir hari ini
      const result = await this.prisma.parkir.aggregate({
        where: {
          createdAt: {
            gte: today, // Greater than or equal start of today
            lt: tomorrow, // Less than start of tomorrow
          },
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      });

      return {
        tanggal: today.toISOString().split('T')[0], // Format: YYYY-MM-DD
        total_pendapatan: result._sum.total || 0,
        jumlah_transaksi: result._count.id || 0,
      };
    } catch (error) {
      throw new BadRequestException('Terjadi kesalahan saat mengambil pendapatan hari ini', error.message);
    }
  }

  /**
   * GET /parkir/pendapatan/tanggal/:tanggal
   * Menghitung total pendapatan pada tanggal tertentu
   *
   * Parameter:
   * - tanggal: string format "YYYY-MM-DD" (contoh: "2024-11-20")
   *
   * Output:
   * {
   *   "tanggal": "2024-11-20",
   *   "total_pendapatan": 35000,
   *   "jumlah_transaksi": 7
   * }
   */
  async getPendapatanByTanggal(tanggal: string) {
    try {
      // Parse tanggal input (format: YYYY-MM-DD)
      const targetDate = new Date(tanggal);

      // Validasi tanggal
      if (isNaN(targetDate.getTime())) {
        throw new NotFoundException(
          `Format tanggal tidak valid. Gunakan format YYYY-MM-DD (contoh: 2024-11-20)`,
        );
      }

      // Set to start of day (00:00:00)
      targetDate.setHours(0, 0, 0, 0);

      // Get next day for range query
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Query data parkir pada tanggal tertentu
      const result = await this.prisma.parkir.aggregate({
        where: {
          createdAt: {
            gte: targetDate, // Greater than or equal start of target date
            lt: nextDay, // Less than start of next day
          },
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
      });

      return {
        tanggal: targetDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        total_pendapatan: result._sum.total || 0,
        jumlah_transaksi: result._count.id || 0,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Terjadi kesalahan saat mengambil pendapatan berdasarkan tanggal', error.message);
    }
  }
}
