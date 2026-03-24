'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock3, ShieldCheck } from 'lucide-react';
import { PatientStatusBadge } from '@/components/patients/patient-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { patientsApi } from '@/lib/api/endpoints';

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
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
        icon={ShieldCheck}
        title="Patient record not found"
        description="The requested patient could not be loaded. Please return to the registry and retry."
      />
    );
  }

  const patient = patientQuery.data;
  const created = searchParams.get('created') === '1';
  const updated = searchParams.get('updated') === '1';
  const urgencyProgress =
    patient.urgencyLevel === 'CRITICAL'
      ? 100
      : patient.urgencyLevel === 'HIGH'
        ? 75
        : patient.urgencyLevel === 'MEDIUM'
          ? 48
          : 25;

  return (
    <PageTransition>
      <div className="space-y-5">
        {created || updated ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {created ? 'Patient created successfully.' : 'Patient updated successfully.'}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="outline">
            <Link href="/patients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/patients/${patient.id}/edit`}>Edit Patient</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{patient.fullName}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {patient.uhid} | {patient.gender} | {patient.age} years | {patient.bloodGroup}
                </p>
              </div>
              <PatientStatusBadge status={patient.caseStatus} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            <div className="surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Urgency Monitor</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{patient.urgencyLevel}</p>
              <Progress value={urgencyProgress} className="mt-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                Priority progression based on current urgency and active request state.
              </p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Medical Profile</p>
              <p className="mt-2 font-semibold text-slate-900">{patient.medicalProfile.primaryDiagnosis}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Comorbidities: {patient.medicalProfile.comorbidities ?? 'Not specified'}
              </p>
              <p className="text-sm text-muted-foreground">Allergies: {patient.medicalProfile.allergies ?? 'Not specified'}</p>
              <p className="text-sm text-muted-foreground">
                Medication: {patient.medicalProfile.currentMedication ?? 'Not specified'}
              </p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Request Summary</p>
              <p className="mt-2 font-semibold text-slate-900">{patient.request.organType}</p>
              <p className="text-sm text-muted-foreground">Required By: {patient.request.requiredBy?.slice(0, 10) ?? '--'}</p>
              <p className="text-sm text-muted-foreground">Hospital Priority: {patient.request.hospitalPriority}</p>
              <p className="mt-2 text-sm text-muted-foreground">{patient.request.notes ?? 'No additional notes.'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Guardian Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-slate-900">{patient.guardians[0]?.fullName ?? 'Not added'}</p>
              <p className="text-muted-foreground">Relation: {patient.guardians[0]?.relation ?? '--'}</p>
              <p className="text-muted-foreground">Phone: {patient.guardians[0]?.phone ?? '--'}</p>
              <p className="text-muted-foreground">Email: {patient.guardians[0]?.email ?? '--'}</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                Case Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(patient.caseTimelines ?? []).length ? (
                <div className="space-y-4">
                  {patient.caseTimelines?.map((event) => (
                    <div key={event.id} className="relative pl-8">
                      <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                      <span className="absolute left-[5px] top-4 h-[calc(100%+6px)] w-px bg-border" />
                      <p className="text-sm font-semibold text-slate-900">{event.eventType.replaceAll('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{event.eventAt.slice(0, 10)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Timeline events will appear here as case actions are recorded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
