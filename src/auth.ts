import type { User } from './types';

export const USER_ACCOUNT = {
  username: 'mahasiswa',
  password: 'lapormercu123',
  nim: '2024001',
  name: 'Muhammad Daffa Aulia Syahrul',
  prodi: 'Sistem Informasi',
};

export const ADMIN_ACCOUNT = {
  username: 'admin',
  password: 'lapormercu123',
  name: 'Administrator',
};

export function authenticateUser(username: string, password: string): User | null {
  const cleanUsername = username.trim();
  if (
    cleanUsername === USER_ACCOUNT.username &&
    password === USER_ACCOUNT.password
  ) {
    return {
      role: 'user',
      username: USER_ACCOUNT.username,
      nim: USER_ACCOUNT.nim,
      name: USER_ACCOUNT.name,
      prodi: USER_ACCOUNT.prodi,
    };
  }
  return null;
}

export function authenticateAdmin(username: string, password: string): User | null {
  const cleanUsername = username.trim();
  if (
    cleanUsername === ADMIN_ACCOUNT.username &&
    password === ADMIN_ACCOUNT.password
  ) {
    return {
      role: 'admin',
      username: ADMIN_ACCOUNT.username,
      name: ADMIN_ACCOUNT.name,
    };
  }
  return null;
}
