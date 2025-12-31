'use server';

import { prisma } from '@/lib/prisma';

export type CreateSessionParams = {
  userId?: string; // optional for now
  sessionType: 'PRACTICE' | 'TOURNAMENT';
  eventId?: string;
  archerName: string;
  archerSurname: string;
  clubName: string;
  bowType: 'COMPOUND' | 'RECURVE' | 'BAREBOW';
  distance: number;
  totalEnds: number;
  arrowsPerEnd: number;
};

export async function createSession(params: CreateSessionParams) {
  const session = await prisma.session.create({
    data: {
      sessionType: params.sessionType,
      userId: params.userId || 'anonymous', // fallback for practice
      eventId: params.eventId || null,
      archerName: params.archerName,
      archerSurname: params.archerSurname,
      clubName: params.clubName,
      bowType: params.bowType,
      distance: params.distance,
      totalEnds: params.totalEnds,
      arrowsPerEnd: params.arrowsPerEnd,
      completed: false,
    },
  });

  return session;
}
