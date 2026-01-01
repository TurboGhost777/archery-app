import type { BowType } from '../types/bow';

export type ScorePageProps = {
  archer: {
    name: string;
    surname: string;
    bowType: BowType;
    distance: number;
    totalEnds: number;
  };
  sessionId: string;
};
