export type ArrowScore = 'M' | 'X' | number | null;

export type StoredSession = {
  id: string;
  archerName: string;
  archerSurname: string;

  bowType: 'COMPOUND' | 'RECURVE' | 'BAREBOW';
  distance: number;
  totalEnds: number;

  /**
   * scores[endIndex][arrowIndex]
   */
  scores: ArrowScore[][];

  createdAt: number;
  updatedAt: number;

  synced: boolean;
  completed: boolean;
};
