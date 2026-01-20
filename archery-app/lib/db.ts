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

export interface StoredSession {
  id?: number;
  userId: string;
  distance: number;
  sessionType: 'PRACTICE' | 'TOURNAMENT';
  totalEnds: number;
  bowType: string;
  scores: number[][]; // 2D array [end][arrow]
  completed: boolean;
  synced?: boolean;
  createdAt: number;
  updatedAt?: number;
  archerName?: string;
  archerSurname?: string;
}

/* ---------- DB ---------- */
export class ArcheryDB extends Dexie {
  users!: Table<User, number>;
  sessions!: Table<StoredSession, number>;
  sightSettings!: Table<SightSetting, number>;

  constructor() {
    super('archery-db');

    this.version(5).stores({
      // 🔐 Auth
      users: '++id, username, createdAt',

      // 🏹 Sessions
      sessions: '++id, userId, createdAt, [userId+createdAt]',

      // 🎯 Sight settings (per user + bow)
      sightSettings:
        '++id, userId, bowName, distance, createdAt, [userId+bowName]',
    });
  }
}

export const db = new ArcheryDB();
