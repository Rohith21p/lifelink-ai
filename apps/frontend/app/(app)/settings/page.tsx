'use client';

import { Sparkles } from 'lucide-react';
import { useDemoStore } from '@/lib/stores/demo-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition } from '@/components/ui/page-transition';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { demoMode, toggleDemoMode, role, setRole } = useDemoStore();

  return (
    <PageTransition>
      <div className="space-y-5">
        <section className="surface-soft p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Workspace Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure demo role context and environment simulation preferences.
          </p>
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Demo Controls</CardTitle>
              <p className="text-sm text-muted-foreground">No authentication in current scope. Use role/demo switch for simulations.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="surface-soft flex items-center justify-between p-3">
                <div>
                  <p className="font-semibold text-slate-900">Demo Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle realistic seeded workflow simulation</p>
                </div>
                <Switch checked={demoMode} onCheckedChange={toggleDemoMode} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">Active Demo Role</p>
                <Select
                  value={role}
                  onChange={(value) => setRole(value as 'ADMIN' | 'COORDINATOR' | 'EXECUTIVE')}
                  options={[
                    { label: 'Executive', value: 'EXECUTIVE' },
                    { label: 'Coordinator', value: 'COORDINATOR' },
                    { label: 'Admin', value: 'ADMIN' },
                  ]}
                />
              </div>

              <div className="surface-soft p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Current Runtime</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={demoMode ? 'success' : 'neutral'}>{demoMode ? 'Demo Active' : 'Demo Off'}</Badge>
                  <Badge variant="default">{role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scope Notes</CardTitle>
              <p className="text-sm text-muted-foreground">Modules intentionally deferred to future delivery steps.</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Authentication and role-based access control</p>
              <p>Live AI/ML match prediction services</p>
              <p>Real WhatsApp, SMS, and email credentials</p>
              <p>Advanced legal and compliance transplant workflow</p>
              <p>Production cloud deployment automation</p>

              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="flex items-center gap-1.5 font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  Step 3 UI Upgrade Active
                </p>
                <p className="mt-1 text-xs">
                  Premium visual language and interaction polish have been applied without altering backend contracts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
