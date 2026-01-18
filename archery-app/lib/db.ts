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

export interface SightSettings {
  id?: number;
  userId: string;
  bowType: 'COMPOUND' | 'RECURVE' | 'BAREBOW';
  distance: number;
  sightMark: number;
  notes?: string;
  createdAt: number;
}

/* -------- STATS CACHE -------- */
export interface StatsCache {
  userId: string;
  computedAt: number;
  data: any;
}

/* -------- DB -------- */
export class ArcheryDB extends Dexie {
  sessions!: Table<StoredSession, string>;
  users!: Table<User, number>;
  statsCache!: Table<StatsCache, string>; // ✅ THIS WAS MISSING
  sightSettings!: Table<SightSettings, number>;

  constructor() {
    super('archery-db');

    this.version(5).stores({
      sessions: 'id, userId, createdAt, [userId+createdAt], synced, completed',
      users: '++id, username, email, club, gender, createdAt',
      statsCache: 'userId, computedAt',
      sightSettings: '++id, userId, bowType, distance, createdAt',     
    });
  }
}

export const db = new ArcheryDB();
