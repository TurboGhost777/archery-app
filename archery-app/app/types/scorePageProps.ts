import { BowType } from '@prisma/client/wasm';

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
