'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { HeartHandshake, Plus } from 'lucide-react';
import { DonorStatusBadge } from '@/components/donors/donor-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { donorsApi } from '@/lib/api/endpoints';
import { Donor } from '@/lib/types/api';

export default function DonorsPage() {
  const donorsQuery = useQuery({
    queryKey: ['donors'],
    queryFn: donorsApi.getAll,
  });

  if (donorsQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (donorsQuery.error || !donorsQuery.data) {
    return (
      <EmptyState
        icon={HeartHandshake}
        title="Unable to load donor registry"
        description="Please verify backend API availability and demo data seeding."
      />
    );
  }

  const donors = donorsQuery.data;
  const availableCount = donors.filter((donor) => donor.status === 'AVAILABLE').length;
  const organOptInCount = donors.filter((donor) => donor.preference?.organDonationOptIn).length;

  return (
    <PageTransition>
      <div className="space-y-5">
        <section className="surface-soft p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Donor Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track donor readiness, screening confidence, and donation preferences.
              </p>
            </div>
            <Button asChild>
              <Link href="/donors/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Donor
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Total Donors</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{donors.length}</p>
            </div>
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Currently Available</p>
              <p className="mt-1 text-xl font-semibold text-success">{availableCount}</p>
            </div>
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Organ Donation Opt-In</p>
              <p className="mt-1 text-xl font-semibold text-primary">{organOptInCount}</p>
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<Donor>
              data={donors}
              searchable
              searchPlaceholder="Search by donor name, code, blood group..."
              searchBy={(donor) =>
                `${donor.donorCode} ${donor.fullName} ${donor.bloodGroup} ${donor.city} ${donor.status}`
              }
              rowKey={(item) => item.id}
              columns={[
                {
                  key: 'donorCode',
                  header: 'Donor Code',
                  sortable: true,
                  sortValue: (donor) => donor.donorCode,
                  render: (donor) => <span className="font-semibold text-slate-900">{donor.donorCode}</span>,
                },
                {
                  key: 'name',
                  header: 'Donor',
                  sortable: true,
                  sortValue: (donor) => donor.fullName,
                  render: (donor) => (
                    <div>
                      <p className="font-semibold text-slate-900">{donor.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {donor.gender} | {donor.age} yrs | {donor.bloodGroup}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'availability',
                  header: 'Availability',
                  render: (donor) => (
                    <div>
                      <p className="font-medium text-slate-900">
                        {donor.availability?.isAvailable ? 'Available' : 'Unavailable'}
                      </p>
                      <p className="text-xs text-muted-foreground">{donor.availability?.preferredTimeWindow ?? '--'}</p>
                    </div>
                  ),
                },
                {
                  key: 'preferences',
                  header: 'Preferences',
                  render: (donor) => (
                    <div className="text-xs text-muted-foreground">
                      Organ: {donor.preference?.organDonationOptIn ? 'Yes' : 'No'}
                      <br />
                      Blood: {donor.preference?.bloodDonationOptIn ? 'Yes' : 'No'}
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  sortable: true,
                  sortValue: (donor) => donor.status,
                  render: (donor) => <DonorStatusBadge status={donor.status} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (donor) => (
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/donors/${donor.id}`}>View</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/donors/${donor.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
