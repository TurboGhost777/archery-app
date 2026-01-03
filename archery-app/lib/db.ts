import Dexie, { Table } from 'dexie';
import type { StoredSession } from '../app/types/score';

export class ArcheryDB extends Dexie {
  sessions!: Table<StoredSession, string>;

  constructor() {
    super('archery-db');

    this.version(2).stores({
      sessions: 'id, createdAt, synced, completed',
    });
  }
}

export const db = new ArcheryDB();
