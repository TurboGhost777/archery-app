'use client';

import ScorePage from '../score-dynamic/page';
import { BowType } from '@prisma/client';

// This is your front page component
export default function FrontPage() {
  // --- Dummy archer data matching ScorePageProps ---
  const dummyArcher = {
    name: 'Test',          // <-- matches archer.name
    surname: 'User',       // <-- matches archer.surname
    bowType: BowType.COMPOUND, // <-- matches archer.bowType
    distance: 18,          // <-- matches archer.distance
    totalEnds: 6,          // <-- matches archer.totalEnds
  };

  // Dummy session ID
  const dummySessionId = 'dummy-session-id';

  // Render the ScorePage with dummy data
  return (
    <div className="min-h-screen bg-gray-100 p-4 text-black">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Front Page - Start Dummy Session
      </h1>

      {/* Pass dummy archer and session ID */}
      <ScorePage archer={dummyArcher} sessionId={dummySessionId} />
    </div>
  );
}
