'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { PatientStatusBadge } from '@/components/patients/patient-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { patientsApi } from '@/lib/api/endpoints';
import { Patient } from '@/lib/types/api';

export default function PatientsPage() {
  const patientsQuery = useQuery({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
  });

  if (patientsQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (patientsQuery.error || !patientsQuery.data) {
    return (
      <EmptyState
        icon={Users}
        title="Unable to load patient registry"
        description="Please verify backend API availability and demo data seeding."
      />
    );
  }

  const patients = patientsQuery.data;
  const criticalCount = patients.filter((patient) => patient.urgencyLevel === 'CRITICAL').length;
  const activeCount = patients.filter((patient) => patient.requestActive).length;

  return (
    <PageTransition>
      <div className="space-y-5">
        <section className="surface-soft p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Patient Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage patient profiles, urgency requests, and guardian communication context.
              </p>
            </div>
            <Button asChild>
              <Link href="/patients/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Total Patients</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{patients.length}</p>
            </div>
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Active Requests</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{activeCount}</p>
            </div>
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Critical Cases</p>
              <p className="mt-1 text-xl font-semibold text-critical">{criticalCount}</p>
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<Patient>
              data={patients}
              searchable
              searchPlaceholder="Search by patient name, UHID, blood group..."
              searchBy={(patient) =>
                `${patient.uhid} ${patient.fullName} ${patient.bloodGroup} ${patient.organNeeded} ${patient.city}`
              }
              rowKey={(item) => item.id}
              columns={[
                {
                  key: 'uhid',
                  header: 'UHID',
                  sortable: true,
                  sortValue: (patient) => patient.uhid,
                  render: (patient) => <span className="font-semibold text-slate-900">{patient.uhid}</span>,
                },
                {
                  key: 'name',
                  header: 'Patient',
                  sortable: true,
                  sortValue: (patient) => patient.fullName,
                  render: (patient) => (
                    <div>
                      <p className="font-semibold text-slate-900">{patient.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.gender} | {patient.age} yrs | {patient.bloodGroup}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'request',
                  header: 'Request',
                  render: (patient) => (
                    <div>
                      <p className="font-medium text-slate-900">{patient.organNeeded}</p>
                      <p className="text-xs text-muted-foreground">Urgency: {patient.urgencyLevel}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Case Status',
                  sortable: true,
                  sortValue: (patient) => patient.caseStatus,
                  render: (patient) => <PatientStatusBadge status={patient.caseStatus} />,
                },
                {
                  key: 'guardian',
                  header: 'Guardian',
                  render: (patient) => (
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{patient.guardians[0]?.fullName ?? 'Not added'}</p>
                      <p className="text-xs text-muted-foreground">{patient.guardians[0]?.phone ?? '--'}</p>
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (patient) => (
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/patients/${patient.id}`}>View</Link>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/patients/${patient.id}/edit`}>Edit</Link>
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
