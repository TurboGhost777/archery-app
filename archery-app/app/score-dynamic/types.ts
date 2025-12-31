import { BowType } from '@prisma/client';

export type Archer = {
  name: string;
  surname: string;
  bowType: BowType;
  distance: number;
  totalEnds: number;
};

export type ScorePageProps = {
  archer: Archer;
  sessionId: string;
};
