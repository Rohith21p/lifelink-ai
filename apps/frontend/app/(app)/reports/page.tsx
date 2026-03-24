'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { ExtractionStatusBadge } from '@/components/reports/extraction-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { PageTransition } from '@/components/ui/page-transition';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { patientsApi, reportsApi } from '@/lib/api/endpoints';
import { ReportFile, ReportFileType } from '@/lib/types/api';
import { reportFileTypeOptions } from '@/lib/types/options';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<ReportFile | null>(null);
  const [form, setForm] = useState({
    patientId: '',
    fileName: '',
    fileType: 'PDF' as ReportFileType,
    fileUrl: '',
    fileSizeKb: '1200',
    notes: '',
  });

  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.getAll(),
  });

  const patientsQuery = useQuery({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
  });

  const uploadMutation = useMutation({
    mutationFn: () =>
      reportsApi.uploadMetadata({
        patientId: form.patientId || patientsQuery.data?.[0]?.id || '',
        fileName: form.fileName,
        fileType: form.fileType,
        fileUrl: form.fileUrl || undefined,
        fileSizeKb: Number(form.fileSizeKb),
        notes: form.notes || undefined,
        metadata: {
          mode: 'demo-upload',
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setForm({
        patientId: patientsQuery.data?.[0]?.id ?? '',
        fileName: '',
        fileType: 'PDF',
        fileUrl: '',
        fileSizeKb: '1200',
        notes: '',
      });
    },
  });

  const extractMutation = useMutation({
    mutationFn: (reportId: string) => reportsApi.triggerMockExtraction(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!(form.patientId || patientsQuery.data?.[0]?.id) || !form.fileName.trim()) {
      return;
    }
    uploadMutation.mutate();
  };

  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);

  if (reportsQuery.isLoading || patientsQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (reportsQuery.error || patientsQuery.error || !patientsQuery.data) {
    return (
      <EmptyState
        icon={FileText}
        title="Unable to load reports module"
        description="Please verify API connectivity and seeded report records."
      />
    );
  }

  return (
    <PageTransition>
      <div className="space-y-5">
        <section className="surface-soft p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Medical Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload report metadata, preview attached files, and validate extraction summaries.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Upload Report Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
              <div className="space-y-1">
                <Label>Patient</Label>
                <Select
                  value={form.patientId || patientsQuery.data[0]?.id}
                  onChange={(value) => setForm((prev) => ({ ...prev, patientId: value }))}
                  options={patientsQuery.data.map((patient) => ({
                    label: `${patient.fullName} (${patient.uhid})`,
                    value: patient.id,
                  }))}
                />
              </div>
              <div className="space-y-1">
                <Label>File Type</Label>
                <Select
                  value={form.fileType}
                  onChange={(value) => setForm((prev) => ({ ...prev, fileType: value as ReportFileType }))}
                  options={reportFileTypeOptions}
                />
              </div>
              <div className="space-y-1">
                <Label>File Name</Label>
                <Input
                  value={form.fileName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fileName: event.target.value }))}
                  placeholder="patient-lab-report.pdf"
                />
              </div>
              <div className="space-y-1">
                <Label>File Size (KB)</Label>
                <Input
                  type="number"
                  value={form.fileSizeKb}
                  onChange={(event) => setForm((prev) => ({ ...prev, fileSizeKb: event.target.value }))}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>File URL (Optional)</Label>
                <Input
                  value={form.fileUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, fileUrl: event.target.value }))}
                  placeholder="/demo/reports/report-123.pdf"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Any extraction guidance or special notes..."
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Metadata'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<ReportFile>
              data={reports}
              searchable
              searchPlaceholder="Search report name, patient, extraction status..."
              searchBy={(report) => `${report.fileName} ${report.fileType} ${report.patient?.fullName ?? ''} ${report.extractionStatus}`}
              rowKey={(item) => item.id}
              emptyLabel="No reports uploaded yet."
              columns={[
                {
                  key: 'file',
                  header: 'File',
                  sortable: true,
                  sortValue: (report) => report.fileName,
                  render: (report) => (
                    <div>
                      <p className="font-semibold text-slate-900">{report.fileName}</p>
                      <p className="text-xs text-muted-foreground">{report.fileType}</p>
                    </div>
                  ),
                },
                {
                  key: 'patient',
                  header: 'Patient',
                  render: (report) => (
                    <div>
                      <p className="font-medium text-slate-900">{report.patient?.fullName ?? '--'}</p>
                      <p className="text-xs text-muted-foreground">{report.patient?.uhid ?? '--'}</p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Extraction',
                  sortable: true,
                  sortValue: (report) => report.extractionStatus,
                  render: (report) => <ExtractionStatusBadge status={report.extractionStatus} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (report) => (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => extractMutation.mutate(report.id)}
                        disabled={extractMutation.isPending}
                      >
                        Run Extraction
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedReport(report)}>
                        Preview
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/reports/${report.id}`}>Open</Link>
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Modal
          open={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          title={selectedReport ? `Report Preview - ${selectedReport.fileName}` : 'Report Preview'}
        >
          {selectedReport ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="surface-soft p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">PDF/Image Preview</p>
                <div className="mt-3 flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-white">
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.fileType} preview placeholder (step 3 visual shell)
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="surface-soft p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Metadata</p>
                  <p className="mt-2 text-sm">Patient: {selectedReport.patient?.fullName ?? '--'}</p>
                  <p className="text-sm">File Type: {selectedReport.fileType}</p>
                  <p className="text-sm">Size: {selectedReport.fileSizeKb ?? '--'} KB</p>
                  <p className="text-sm">Uploaded: {new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
                <div className="surface-soft p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Extracted Summary</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {selectedReport.extractedSummary ?? 'No extracted summary available yet.'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </PageTransition>
  );
}
