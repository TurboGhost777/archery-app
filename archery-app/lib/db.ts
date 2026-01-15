import Dexie, { Table } from 'dexie';
import type { StoredSession } from '../app/types/score';

/* -------- USER -------- */
export interface User {
  id?: number;
  username: string;
  password: string;

  archerName: string;
  archerSurname: string;

  age: number | null;
  gender: 'MALE' | 'FEMALE';

  club?: string;
  email?: string;

  createdAt: number;
}

/* -------- DB -------- */
export class ArcheryDB extends Dexie {
  sessions!: Table<StoredSession, string>;
  users!: Table<User, number>;

  constructor() {
    super('archery-db');

    /* ✅ VERSION BUMP */
    this.version(4).stores({
  sessions: 'id, userId, createdAt, [userId+createdAt], synced, completed',
  users: '++id, username, email, club, gender, createdAt',
});

  }
}

export const db = new ArcheryDB();
