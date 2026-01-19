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

/* -------- STATS CACHE -------- */
export interface StatsCache {
  userId: string;
  computedAt: number;
  data: any;
}

/* -------- SIGHT SETTINGS -------- */
export interface SightSettings {
  id?: number;
  userId: string;
  bowId: string;          // 🔑 supports multiple bows per archer
  bowName: string;

  sightMarks: {
    distance: number;
    mark: number;
  }[];

  createdAt: number;
  updatedAt: number;
}

/* -------- DB -------- */
export class ArcheryDB extends Dexie {
  sessions!: Table<StoredSession, string>;
  users!: Table<User, number>;
  statsCache!: Table<StatsCache, string>;
  sightSettings!: Table<SightSettings, number>;

  constructor() {
    super('archery-db');

    this.version(4).stores({
      sessions: 'id, userId, createdAt, [userId+createdAt], synced, completed',
      users: '++id, username, email, club, gender, createdAt',
      statsCache: 'userId, computedAt',
      sightSettings: '++id, userId, bowId, [userId+bowId], updatedAt',
    });
  }
}

export const db = new ArcheryDB();
