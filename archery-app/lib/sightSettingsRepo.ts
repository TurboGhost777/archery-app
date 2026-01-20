// lib/sightSettingsRepo.ts
import { db, type SightSetting } from '@/lib/db';

/* =======================
   READ
======================= */

export async function getSightSettingsForBow(
  userId: string,
  bowName: string
): Promise<SightSetting[]> {
  return db.sightSettings
    .where('[userId+bowName]')
    .equals([userId, bowName])
    .sortBy('distance');
}

/* =======================
   CREATE
======================= */

export async function addSightSetting(
  data: Omit<SightSetting, 'id' | 'createdAt' | 'updatedAt'>
) {
  return db.sightSettings.add({
    ...data,
    createdAt: Date.now(), // number
    updatedAt: Date.now(), // number
  });
}

/* =======================
   UPDATE
======================= */

export async function updateSightSetting(
  id: number,
  data: Partial<SightSetting>
) {
  return db.sightSettings.update(id, {
    ...data,
    updatedAt: Date.now(),
  });
}

/* =======================
   DELETE
======================= */

export async function deleteSightSetting(id: number) {
  return db.sightSettings.delete(id);
}
