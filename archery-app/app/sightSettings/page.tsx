'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Plus, Target, Trash2, ArrowLeft } from 'lucide-react';

import { getLoggedInUser } from '@/lib/auth';
import { db, SightSetting } from '@/lib/db';
import {
  addSightSetting,
  deleteSightSetting,
} from '@/lib/sightSettingsRepo';

export default function SightSettingsPage() {
  const router = useRouter();
  const user = getLoggedInUser();

  const [bowName, setBowName] = useState('');
  const [settings, setSettings] = useState<SightSetting[]>([]);
  const [loading, setLoading] = useState(false);

  const [distance, setDistance] = useState('');
  const [sightMark, setSightMark] = useState('');
  const [notes, setNotes] = useState('');

  /* ---------------- Auth Redirect ---------------- */
  useEffect(() => {
    if (!user) router.replace('/login');
  }, [router, user]);

  /* ---------------- Load Settings ---------------- */
 useEffect(() => {
  if (!user) return;

  let cancelled = false;

  // Only run if bowName actually exists
  if (!bowName) {
    setSettings([]); // clear settings once
    return;
  }

  const fetchSettings = async () => {
    setLoading(true);

    const data = await db.sightSettings
      .where('[userId+bowName]')
      .equals([user.username, bowName])
      .toArray();

    if (!cancelled) {
      // Only update if data actually changed
      setSettings(prev => {
        const same =
          prev.length === data.length &&
          prev.every((s, i) => s.id === data[i].id);
        return same ? prev : data;
      });
      setLoading(false);
    }
  };

  fetchSettings();

  return () => {
    cancelled = true;
  };
}, [bowName, user?.username]); // only rerun if bowName or username changes


  /* ---------------- Add Setting ---------------- */
  const handleAdd = async () => {
    if (!user || !bowName || !distance || !sightMark) return;

    const newSetting: Omit<SightSetting, 'id'> = {
      userId: user.username,
      bowName,
      distance: Number(distance),
      sightMark,
      notes: notes || undefined,
      createdAt: Date.now(),
    };

    const id = await addSightSetting(newSetting);

    // Immediately update UI
    setSettings(prev => [...prev, { id, ...newSetting }]);

    setDistance('');
    setSightMark('');
    setNotes('');
  };

  /* ---------------- Delete Setting ---------------- */
  const handleDelete = async (id?: number) => {
    if (!id) return;

    await deleteSightSetting(id);

    setSettings(prev => prev.filter(s => s.id !== id));
  };

  /* ======================= UI ======================= */
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
     {/* Header */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Target className="w-8 h-8" />
    <h1 className="text-3xl font-semibold">Sight Settings</h1>
  </div>

  <Button
    variant="outline"
    onClick={() => router.push('/sessions')}
    className="flex items-center gap-2"
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Sessions
  </Button>
</div>

      {/* Bow Selector */}
      <Card className="rounded-2xl">
        <CardContent className="p-6 space-y-2">
          <Label>Bow Name</Label>
          <Input
            placeholder="e.g. Hoyt Vantage Elite"
            value={bowName}
            onChange={e => setBowName(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Add Setting */}
      <Card className="rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-medium">Add Sight Setting</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Distance (m)</Label>
              <Input
                type="number"
                value={distance}
                onChange={e => setDistance(e.target.value)}
              />
            </div>

            <div>
              <Label>Sight Mark</Label>
              <Input
                value={sightMark}
                onChange={e => setSightMark(e.target.value)}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAdd}
            disabled={!bowName || !distance || !sightMark}
            className="flex gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Setting
          </Button>
        </CardContent>
      </Card>

      {/* Stored Settings */}
      <Card className="rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-medium">Stored Settings</h2>

          {!bowName && (
            <p className="text-sm text-muted-foreground">
              Select a bow to view saved settings.
            </p>
          )}

          {loading && <p className="text-sm">Loading…</p>}

          {settings.map(s => (
            <div
              key={s.id}
              className="flex justify-between items-center border rounded-xl p-4"
            >
              <div>
                <div className="font-medium">{s.distance}m</div>
                <div className="text-sm text-muted-foreground">
                  Sight: {s.sightMark}
                  {s.notes && ` • ${s.notes}`}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(s.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {bowName && !loading && settings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No sight settings saved for this bow.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
