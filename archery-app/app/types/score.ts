export type ArrowScore = 'M' | 'X' | number | null;

export type StoredScore = {
  sessionId: string;
  endIndex: number;
  arrowIndex: number;
  value: ArrowScore;
};

export type StoredSession = {
  id: string;
  archerName: string;
  archerSurname: string;
  bowType: 'COMPOUND' | 'RECURVE' | 'BAREBOW';
  distance: number;
  totalEnds: number;
  createdAt: number;
  updatedAt: number;
  synced: boolean;
  completed: boolean; // New field to indicate if the session is completed
};
