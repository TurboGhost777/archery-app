import Dexie, { Table } from 'dexie';
import type { StoredSession, StoredScore } from '../app/types/score';

export class ArcheryDB extends Dexie {
  sessions!: Table<StoredSession, string>;
  scores!: Table<StoredScore, [string, number, number]>;

  constructor() {
    super('archery-db');

    this.version(1).stores({
      sessions: 'id, createdAt, synced',
      scores: '[sessionId+endIndex+arrowIndex], sessionId',
    });
  }
}

export const db = new ArcheryDB();
