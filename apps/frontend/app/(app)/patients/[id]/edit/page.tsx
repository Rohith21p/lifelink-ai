'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { PatientForm } from '@/components/patients/patient-form';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { patientsApi } from '@/lib/api/endpoints';

export default function EditPatientPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);

  const patientQuery = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.getById(id),
    enabled: Boolean(id),
  });

  if (patientQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (patientQuery.error || !patientQuery.data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Patient not found"
        description="The requested patient record could not be loaded for editing."
      />
    );
  }

  return (
    <PageTransition>
      <div className="space-y-4">
        <section className="surface-soft p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Edit Patient Case</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update medical context, request details, and guardian information.</p>
        </section>
        <PatientForm mode="edit" initialPatient={patientQuery.data} />
      </div>
    </PageTransition>
  );
}
