'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { DonorStatusBadge } from '@/components/donors/donor-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { donorsApi } from '@/lib/api/endpoints';

export default function DonorDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = String(params.id);

  const donorQuery = useQuery({
    queryKey: ['donor', id],
    queryFn: () => donorsApi.getById(id),
    enabled: Boolean(id),
  });

  if (donorQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (donorQuery.error || !donorQuery.data) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Donor record not found"
        description="The requested donor could not be loaded. Please return to the registry and retry."
      />
    );
  }

  const donor = donorQuery.data;
  const created = searchParams.get('created') === '1';
  const updated = searchParams.get('updated') === '1';
  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      (donor.availability?.isAvailable ? 35 : 10) +
        (donor.preference?.organDonationOptIn ? 20 : 0) +
        (donor.preference?.bloodDonationOptIn ? 20 : 0) +
        (donor.status === 'AVAILABLE' ? 25 : donor.status === 'TEMP_UNAVAILABLE' ? 10 : 5),
    ),
  );

  return (
    <PageTransition>
      <div className="space-y-5">
        {created || updated ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {created ? 'Donor created successfully.' : 'Donor updated successfully.'}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline">
            <Link href="/donors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Donors
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/donors/${donor.id}/edit`}>Edit Donor</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{donor.fullName}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {donor.donorCode} | {donor.gender} | {donor.age} years | {donor.bloodGroup}
                </p>
              </div>
              <DonorStatusBadge status={donor.status} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Donor Readiness Score</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{readinessScore}%</p>
              <Progress value={readinessScore} className="mt-2" />
              <p className="mt-2 text-xs text-muted-foreground">Composite indicator from status, preferences, and availability.</p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Medical Profile</p>
              <p className="mt-2 text-sm text-muted-foreground">BMI: {donor.medicalProfile?.bmi ?? '--'}</p>
              <p className="text-sm text-muted-foreground">
                Conditions: {donor.medicalProfile?.medicalConditions ?? 'Not specified'}
              </p>
              <p className="text-sm text-muted-foreground">
                Screening: {donor.medicalProfile?.infectiousDiseaseScreening ?? 'Not specified'}
              </p>
              <p className="text-sm text-muted-foreground">Notes: {donor.medicalProfile?.notes ?? 'None'}</p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Availability</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Available: {donor.availability?.isAvailable ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">
                Days: {donor.availability?.availableDays?.join(', ') || 'Not specified'}
              </p>
              <p className="text-sm text-muted-foreground">
                Time Window: {donor.availability?.preferredTimeWindow ?? 'Not specified'}
              </p>
              <p className="text-sm text-muted-foreground">
                Radius: {donor.availability?.travelRadiusKm ? `${donor.availability.travelRadiusKm} km` : 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="surface-soft p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Organ Donation</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {donor.preference?.organDonationOptIn ? 'Opted In' : 'Not Opted In'}
              </p>
            </div>
            <div className="surface-soft p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Blood Donation</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {donor.preference?.bloodDonationOptIn ? 'Opted In' : 'Not Opted In'}
              </p>
            </div>
            <div className="surface-soft p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Max Requests / Month</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{donor.preference?.maxRequestsPerMonth ?? '--'}</p>
            </div>
            <div className="surface-soft p-3 sm:col-span-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Preferred Hospitals</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {donor.preference?.preferredHospitals?.join(', ') || 'Not specified'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
