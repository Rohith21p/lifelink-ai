'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { DonorForm } from '@/components/donors/donor-form';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { donorsApi } from '@/lib/api/endpoints';

export default function EditDonorPage() {
  const params = useParams<{ id: string }>();
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
        icon={AlertTriangle}
        title="Donor not found"
        description="The requested donor record could not be loaded for editing."
      />
    );
  }

  return (
    <PageTransition>
      <div className="space-y-4">
        <section className="surface-soft p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Edit Donor Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update readiness, screening, and availability preferences.</p>
        </section>
        <DonorForm mode="edit" initialDonor={donorQuery.data} />
      </div>
    </PageTransition>
  );
}
