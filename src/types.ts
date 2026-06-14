export interface User {
  nim?: string;
  username?: string;
  name: string;
  prodi?: string;
  role: 'user' | 'admin';
}

export interface Laporan {
  id: number;
  nim: string;
  nama: string;
  prodi: string;
  judul: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  tanggal: string;
  status: 'Belum Diproses' | 'Sedang Diproses' | 'Selesai';
  rating?: number;
  feedback?: string;
  foto?: string;
}
