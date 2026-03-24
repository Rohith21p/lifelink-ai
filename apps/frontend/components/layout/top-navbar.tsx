'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  BrainCircuit,
  ChevronsUpDown,
  CircleUserRound,
  Plus,
  Search,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { notificationsApi } from '@/lib/api/endpoints';
import { useDemoStore } from '@/lib/stores/demo-store';
import { useUiStore } from '@/lib/stores/ui-store';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const mobileLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/patients', label: 'Patients' },
  { href: '/donors', label: 'Donors' },
  { href: '/matches', label: 'Matches' },
  { href: '/reports', label: 'Reports' },
  { href: '/blood-banks', label: 'Blood Banks' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/settings', label: 'Settings' },
];

export function TopNavbar() {
  const { role, setRole, demoMode, toggleDemoMode } = useDemoStore();
  const { insightPanelOpen, toggleInsightPanel } = useUiStore();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const notificationsQuery = useQuery({
    queryKey: ['notifications-nav'],
    queryFn: () => notificationsApi.getAll({ limit: 6 }),
  });

  const unreadCount = useMemo(
    () => (notificationsQuery.data ?? []).filter((notification) => !notification.isRead).length,
    [notificationsQuery.data],
  );

  const roleLabel = useMemo(() => {
    if (role === 'ADMIN') return 'Admin Command';
    if (role === 'COORDINATOR') return 'Coordinator Desk';
    return 'Executive Overview';
  }, [role]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-white/78 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">LifeLink AI</p>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Stethoscope className="h-5 w-5 text-primary" />
              {roleLabel}
            </h2>
          </div>

          <div className="relative ml-auto min-w-[240px] flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search patients, donors, matches..."
              className="h-10 w-full rounded-xl border border-input/90 bg-white px-9 text-sm text-slate-800 shadow-[0_10px_28px_-24px_rgba(2,132,199,0.55)] focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-medium text-slate-700 hover:bg-muted/70"
              onClick={() => {
                setShowQuickActions((current) => !current);
                setShowNotif(false);
              }}
            >
              <Plus className="h-4 w-4 text-primary" />
              Quick Actions
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {showQuickActions ? (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white p-2 shadow-panel">
                <Link className="block rounded-lg px-3 py-2 text-sm hover:bg-muted/60" href="/patients/new">
                  Add Patient
                </Link>
                <Link className="block rounded-lg px-3 py-2 text-sm hover:bg-muted/60" href="/donors/new">
                  Add Donor
                </Link>
                <Link className="block rounded-lg px-3 py-2 text-sm hover:bg-muted/60" href="/matches">
                  Open Match Queue
                </Link>
                <Link className="block rounded-lg px-3 py-2 text-sm hover:bg-muted/60" href="/reports">
                  Review Reports
                </Link>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={toggleInsightPanel}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors',
              insightPanelOpen
                ? 'border-primary/25 bg-primary/10 text-primary'
                : 'border-border bg-white text-slate-700 hover:bg-muted/70',
            )}
          >
            <BrainCircuit className="h-4 w-4" />
            AI Panel
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotif((current) => !current);
                setShowQuickActions(false);
              }}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-slate-700 hover:bg-muted/60"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-critical px-1.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {showNotif ? (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-white p-2 shadow-panel">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Recent Notifications
                </p>
                <div className="max-h-72 space-y-1 overflow-auto">
                  {(notificationsQuery.data ?? []).map((notification) => (
                    <Link
                      key={notification.id}
                      href="/notifications"
                      className="block rounded-lg px-3 py-2 hover:bg-muted/60"
                    >
                      <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{notification.message}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 md:flex">
            <CircleUserRound className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Demo Operator</p>
              <p className="text-[11px] text-muted-foreground">Hospital Control Desk</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-white px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Role View</p>
            <Select
              value={role}
              onChange={(value) => setRole(value as 'ADMIN' | 'COORDINATOR' | 'EXECUTIVE')}
              options={[
                { label: 'Executive', value: 'EXECUTIVE' },
                { label: 'Coordinator', value: 'COORDINATOR' },
                { label: 'Admin', value: 'ADMIN' },
              ]}
              className="h-8 border-0 p-0 text-sm font-semibold"
            />
          </div>
          <div className="rounded-xl border border-border bg-white px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Demo Mode</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{demoMode ? 'Enabled' : 'Disabled'}</p>
              <Switch checked={demoMode} onCheckedChange={toggleDemoMode} />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm text-slate-700">
              {searchValue ? `Searching "${searchValue}"` : 'Use global search to navigate faster'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {mobileLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold',
                pathname.startsWith(item.href)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-white text-slate-700',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
