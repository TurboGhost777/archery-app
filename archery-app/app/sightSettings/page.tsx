'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Target } from 'lucide-react';

export default function SightSettingsPage() {
  const [selectedBow, setSelectedBow] = useState('');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8" />
        <h1 className="text-3xl font-semibold">Sight Settings</h1>
      </div>

      {/* Bow Selector */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bow">Select Bow</Label>
            <Input
              id="bow"
              placeholder="e.g. Hoyt Vantage Elite"
              value={selectedBow}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSelectedBow(e.target.value)
                       }
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Sight Setting */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-medium">Add Sight Setting</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance">Distance</Label>
              <Input id="distance" placeholder="e.g. 20m" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sight">Sight Mark</Label>
              <Input id="sight" placeholder="e.g. 3.2" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Optional" />
            </div>
          </div>

          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Setting
          </Button>
        </CardContent>
      </Card>

      {/* Stored Settings (UI Placeholder) */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-medium">Stored Settings</h2>

          <div className="text-sm text-muted-foreground">
            Sight settings for the selected bow will appear here.
          </div>

          {/* Example Row */}
          <div className="flex justify-between items-center border rounded-xl p-4">
            <div>
              <div className="font-medium">20m</div>
              <div className="text-sm text-muted-foreground">Sight: 3.2</div>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
