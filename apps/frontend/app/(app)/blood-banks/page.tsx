'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Droplets } from 'lucide-react';
import { StockLevelBadge } from '@/components/blood-banks/stock-level-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/ui/page-transition';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { bloodBanksApi } from '@/lib/api/endpoints';
import { BloodInventoryItem, BloodRequest } from '@/lib/types/api';

const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => ({
  label: group,
  value: group,
}));

export default function BloodBanksPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    bloodBankId: '',
    bloodGroup: 'O+',
    unitsAvailable: '18',
    lowStockThreshold: '10',
    lastUpdatedBy: 'Demo Coordinator',
  });

  const banksQuery = useQuery({
    queryKey: ['blood-banks'],
    queryFn: bloodBanksApi.getAll,
  });

  const inventoryQuery = useQuery({
    queryKey: ['blood-inventory'],
    queryFn: () => bloodBanksApi.getInventory(),
  });

  const requestsQuery = useQuery({
    queryKey: ['blood-requests'],
    queryFn: () => bloodBanksApi.getRequests(),
  });

  const lowStockQuery = useQuery({
    queryKey: ['blood-low-stock-alerts'],
    queryFn: bloodBanksApi.getLowStockAlerts,
  });

  const recentActivityQuery = useQuery({
    queryKey: ['blood-stock-activity'],
    queryFn: bloodBanksApi.getRecentStockActivity,
  });

  const upsertStockMutation = useMutation({
    mutationFn: () =>
      bloodBanksApi.upsertStock({
        bloodBankId: form.bloodBankId || banksQuery.data?.[0]?.id || '',
        bloodGroup: form.bloodGroup,
        unitsAvailable: Number(form.unitsAvailable),
        lowStockThreshold: Number(form.lowStockThreshold),
        lastUpdatedBy: form.lastUpdatedBy,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blood-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['blood-low-stock-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['blood-stock-activity'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(form.bloodBankId || banksQuery.data?.[0]?.id)) {
      return;
    }
    upsertStockMutation.mutate();
  };

  const inventory = inventoryQuery.data ?? [];
  const lowStock = lowStockQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const recentActivity = recentActivityQuery.data ?? [];

  const groupedStock = useMemo(() => {
    const totals = new Map<string, number>();
    inventory.forEach((item) => {
      totals.set(item.bloodGroup, (totals.get(item.bloodGroup) ?? 0) + item.unitsAvailable);
    });
    return Array.from(totals.entries())
      .map(([bloodGroup, totalUnits]) => ({ bloodGroup, totalUnits }))
      .sort((a, b) => b.totalUnits - a.totalUnits);
  }, [inventory]);

  if (
    banksQuery.isLoading ||
    inventoryQuery.isLoading ||
    requestsQuery.isLoading ||
    lowStockQuery.isLoading ||
    recentActivityQuery.isLoading
  ) {
    return <Skeleton className="h-80" />;
  }

  if (
    banksQuery.error ||
    inventoryQuery.error ||
    requestsQuery.error ||
    lowStockQuery.error ||
    recentActivityQuery.error ||
    !banksQuery.data
  ) {
    return (
      <EmptyState
        icon={Droplets}
        title="Unable to load blood bank module"
        description="Please verify blood bank APIs and seeded inventory data."
      />
    );
  }

  return (
    <PageTransition>
      <div className="space-y-5">
        <section className="surface-soft p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Blood Bank Command</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor blood group inventory, low-stock risks, and request activity from one unified panel.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Stock by Blood Group</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {groupedStock.map((item) => (
                <div key={item.bloodGroup} className="surface-soft p-4">
                  <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Blood Group</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.bloodGroup}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.totalUnits} units</p>
                </div>
              ))}
            </div>
            <div className="h-72 rounded-2xl border border-border/70 bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupedStock}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="bloodGroup" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="totalUnits" fill="#0284c7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Blood Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" onSubmit={onSubmit}>
              <div className="space-y-1">
                <Label>Blood Bank</Label>
                <Select
                  value={form.bloodBankId || banksQuery.data[0]?.id}
                  onChange={(value) => setForm((prev) => ({ ...prev, bloodBankId: value }))}
                  options={banksQuery.data.map((bank) => ({ label: `${bank.name} (${bank.code})`, value: bank.id }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Blood Group</Label>
                <Select
                  value={form.bloodGroup}
                  onChange={(value) => setForm((prev) => ({ ...prev, bloodGroup: value }))}
                  options={bloodGroupOptions}
                />
              </div>
              <div className="space-y-1">
                <Label>Units Available</Label>
                <Input
                  type="number"
                  value={form.unitsAvailable}
                  onChange={(event) => setForm((prev) => ({ ...prev, unitsAvailable: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Low Stock Threshold</Label>
                <Input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(event) => setForm((prev) => ({ ...prev, lowStockThreshold: event.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Updated By</Label>
                <Input
                  value={form.lastUpdatedBy}
                  onChange={(event) => setForm((prev) => ({ ...prev, lastUpdatedBy: event.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={upsertStockMutation.isPending} className="w-full">
                  {upsertStockMutation.isPending ? 'Saving...' : 'Save Stock'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Low Stock Warnings</CardTitle>
            <Badge variant={lowStock.length ? 'danger' : 'success'}>{lowStock.length} Alerts</Badge>
          </CardHeader>
          <CardContent>
            <DataTable<BloodInventoryItem>
              data={lowStock}
              rowKey={(item) => item.id}
              emptyLabel="No low stock alerts currently."
              columns={[
                {
                  key: 'bank',
                  header: 'Blood Bank',
                  render: (item) => <p className="font-semibold text-slate-900">{item.bloodBank?.name ?? '--'}</p>,
                },
                {
                  key: 'group',
                  header: 'Blood Group',
                  sortable: true,
                  sortValue: (item) => item.bloodGroup,
                  render: (item) => <p>{item.bloodGroup}</p>,
                },
                {
                  key: 'units',
                  header: 'Units',
                  sortable: true,
                  sortValue: (item) => item.unitsAvailable,
                  render: (item) => <p>{item.unitsAvailable}</p>,
                },
                {
                  key: 'status',
                  header: 'Stock Health',
                  render: (item) => <StockLevelBadge units={item.unitsAvailable} threshold={item.lowStockThreshold} />,
                },
              ]}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Blood Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable<BloodRequest>
                data={requests}
                rowKey={(item) => item.id}
                columns={[
                  {
                    key: 'group',
                    header: 'Blood Group',
                    render: (item) => <p>{item.bloodGroup}</p>,
                  },
                  {
                    key: 'units',
                    header: 'Units',
                    render: (item) => <p>{item.unitsRequested}</p>,
                  },
                  {
                    key: 'priority',
                    header: 'Priority',
                    render: (item) => <Badge variant={item.priority === 'CRITICAL' ? 'danger' : 'warning'}>{item.priority}</Badge>,
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (item) => <Badge variant="neutral">{item.status}</Badge>,
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable<BloodInventoryItem>
                data={recentActivity}
                rowKey={(item) => item.id}
                columns={[
                  {
                    key: 'bank',
                    header: 'Bank',
                    render: (item) => <p className="font-semibold text-slate-900">{item.bloodBank?.code ?? '--'}</p>,
                  },
                  {
                    key: 'group',
                    header: 'Group',
                    render: (item) => <p>{item.bloodGroup}</p>,
                  },
                  {
                    key: 'units',
                    header: 'Units',
                    render: (item) => <p>{item.unitsAvailable}</p>,
                  },
                  {
                    key: 'status',
                    header: 'Level',
                    render: (item) => <StockLevelBadge units={item.unitsAvailable} threshold={item.lowStockThreshold} />,
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
