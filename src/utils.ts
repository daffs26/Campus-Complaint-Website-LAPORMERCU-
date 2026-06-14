import type { Laporan } from './types';

export const DEFAULT_LAPORAN: Laporan[] = [
  { id: 1, nim: '2024001', nama: 'Muhammad Daffa Aulia Syahrul', prodi: 'Sistem Informasi', judul: 'AC Rusak Tidak Berfungsi', kategori: 'Laboratorium', lokasi: 'Lab Komputer Lt.2', deskripsi: 'AC di lab komputer sudah 3 hari tidak berfungsi, ruangan sangat panas saat siang hari.', tanggal: '2025-01-15', status: 'Diproses' },
  { id: 2, nim: '2024003', nama: 'Ahmad', prodi: 'Teknik Informatika', judul: 'Proyektor Bermasalah', kategori: 'Gedung / Ruang Kelas', lokasi: 'Ruang 301 Gedung A', deskripsi: 'Proyektor tidak bisa menampilkan gambar dengan jelas, layar tampak buram dan redup.', tanggal: '2025-01-10', status: 'Selesai', rating: 5, feedback: 'Proyektor sudah diganti baru, layarnya sangat jernih sekarang. Terima kasih!' },
  { id: 3, nim: '2024004', nama: 'Budi', prodi: 'Teknik Mesin', judul: 'Toilet Mampet Lantai 2', kategori: 'Toilet', lokasi: 'Toilet Gedung B Lt.2', deskripsi: 'Toilet mampet dan mengeluarkan bau tidak sedap sudah 2 hari.', tanggal: '2025-01-16', status: 'Baru' },
  { id: 4, nim: '2024005', nama: 'Citra', prodi: 'Manajemen', judul: 'Lampu Parkir Mati', kategori: 'Parkiran', lokasi: 'Parkiran Belakang Kampus', deskripsi: 'Lampu penerangan di parkiran belakang mati sejak seminggu lalu.', tanggal: '2025-01-12', status: 'Selesai', rating: 4, feedback: 'Penerangan cukup baik sekarang.' },
  { id: 5, nim: '2024006', nama: 'Diana', prodi: 'Desain Komunikasi Visual', judul: 'Wifi Perpustakaan Lambat', kategori: 'Perpustakaan', lokasi: 'Perpustakaan Pusat', deskripsi: 'Koneksi wifi di perpustakaan sangat lambat.', tanggal: '2025-01-17', status: 'Baru' },
  { id: 6, nim: '2024002', nama: 'Daffa Aulia', prodi: 'Sistem Informasi', judul: 'Meja Kantin Rusak', kategori: 'Kantin', lokasi: 'Kantin Utama', deskripsi: 'Banyak meja dan kursi di kantin yang rusak dan kotor.', tanggal: '2025-01-14', status: 'Diproses' },
];

export function getLaporan(): Laporan[] {
  const data = localStorage.getItem('laporan_mercumb');
  if (!data) {
    localStorage.setItem('laporan_mercumb', JSON.stringify(DEFAULT_LAPORAN));
    return DEFAULT_LAPORAN;
  }
  return JSON.parse(data);
}

export function saveLaporan(laporanList: Laporan[]): void {
  localStorage.setItem('laporan_mercumb', JSON.stringify(laporanList));
}

export function formatTanggal(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
