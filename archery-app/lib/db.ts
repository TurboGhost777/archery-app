import Dexie, { Table } from 'dexie';

/* ---------- USER ---------- */
export interface User {
  id?: number;
  username: string;
  password: string;

  archerName: string;
  archerSurname: string;

  age?: number | null;
  gender?: 'MALE' | 'FEMALE';

  club?: string;
  email?: string;

  createdAt: number;
}

/* ---------- SIGHT SETTINGS ---------- */
export interface SightSetting {
  id?: number;
  userId: string;
  bowName: string;
  distance: number;
  sightMark: string;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

/* ---------- DB SESSION (PERSISTENCE ONLY) ---------- */
export interface DBSession {
  id?: number;
  userId: string;
  distance: number;
  sessionType: 'PRACTICE' | 'TOURNAMENT';
  totalEnds: number;
  bowType: string;
  scores: number[][];
  completed: boolean;
  synced?: boolean;
  createdAt: number;
  updatedAt?: number;
  archerName?: string;
  archerSurname?: string;
}

/* ---------- STATS CACHE ---------- */
export interface StatsCache {
  userId: string;
  computedAt: number;
  data: any;
}

/* ---------- DB ---------- */
export class ArcheryDB extends Dexie {
  users!: Table<User, number>;
  sessions!: Table<DBSession, number>;
  sightSettings!: Table<SightSetting, number>;
  statsCache!: Table<StatsCache, string>;

  constructor() {
    super('archery-db');

    this.version(6).stores({
      users: '++id, username, createdAt',
      sessions: '++id, userId, createdAt, [userId+createdAt]',
      sightSettings:
        '++id, userId, bowName, distance, createdAt, [userId+bowName]',
      statsCache: 'userId',
    });
  }
}

export const db = new ArcheryDB();
