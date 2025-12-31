'use server';
import { prisma } from '../../lib/prisma';
import { BowType, SessionType } from '@prisma/client';

interface CreateSessionParams {
  userId: string;
  archerName: string;
  archerSurname: string;
  bowType: BowType;
  distance: number;
  totalEnds: number;
  sessionType: SessionType;
  arrowsPerEnd: number;
  clubName?: string; // optional in the type, we'll hardcode
}

export async function createSession(params: CreateSessionParams) {
  const session = await prisma.session.create({
    data: {
      ...params,
      clubName: params.clubName ?? 'Default Club', // ✅ hardcoded for now
    },
  });

  return session;
}
