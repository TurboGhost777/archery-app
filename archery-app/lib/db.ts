import Dexie, { Table } from 'dexie';

/* keep existing session type */
import type { StoredSession } from '../app/types/score';

/* ---------- ADD THIS IMPORT ---------- */
import type { StoredScore } from '../app/types/score';

/* -------- USER INTERFACE (same as yours) -------- */
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

/* -------- EXTEND DB -------- */
export class ArcheryDB extends Dexie {
  sessions!: Table<StoredSession, string>;

  /* ---------- NEW TABLE ---------- */
  scores!: Table<StoredScore, [string, number, number]>;

  users!: Table<User, number>;

  constructor() {
    super('archery-db');

    this.version(3).stores({
      sessions: 'id, createdAt, synced, completed',

      /* ---------- ADD STORE ---------- */
      scores: '[sessionId+endIndex+arrowIndex], sessionId',

      users: '++id, username, email, club, gender, createdAt',
    });
  }
}

export const db = new ArcheryDB();
