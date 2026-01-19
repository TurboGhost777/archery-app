import { db } from '@/lib/db';
import type { SightSettings } from '@/lib/db';

export async function saveSightSettings(
  settings: Omit<SightSettings, 'id' | 'createdAt' | 'updatedAt'>
) {
  const now = Date.now();

  const existing = await db.sightSettings
    .where('[userId+bowId]')
    .equals([settings.userId, settings.bowId])
    .first();

  if (existing) {
    await db.sightSettings.update(existing.id!, {
      ...settings,
      updatedAt: now,
    });
  } else {
    await db.sightSettings.add({
      ...settings,
      createdAt: now,
      updatedAt: now,
    });
  }
}
