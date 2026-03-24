'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ExtractionStatusBadge } from '@/components/reports/extraction-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { reportsApi } from '@/lib/api/endpoints';

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const reportQuery = useQuery({
    queryKey: ['report', params.id],
    queryFn: () => reportsApi.getById(params.id),
  });

  const extractionQuery = useQuery({
    queryKey: ['report-extraction', params.id],
    queryFn: () => reportsApi.getExtractionSummary(params.id),
  });

  const extractionMutation = useMutation({
    mutationFn: () => reportsApi.triggerMockExtraction(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report', params.id] });
      queryClient.invalidateQueries({ queryKey: ['report-extraction', params.id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (reportQuery.isLoading || extractionQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (reportQuery.error || extractionQuery.error || !reportQuery.data || !extractionQuery.data) {
    return (
      <EmptyState
        icon={FileText}
        title="Unable to load report detail"
        description="Please retry after confirming report APIs and seeded data."
      />
    );
  }

  const report = reportQuery.data;
  const extraction = extractionQuery.data;
  const extractedObject =
    extraction.extraction && typeof extraction.extraction === 'object'
      ? (extraction.extraction as Record<string, unknown>)
      : null;

  return (
    <PageTransition>
      <div className="space-y-5">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Report Detail</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Medical report metadata, extraction state, and parsed summary context.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ExtractionStatusBadge status={report.extractionStatus} />
              <Badge variant="neutral">{report.fileType}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">File Metadata</p>
              <h3 className="mt-2 text-base font-semibold">{report.fileName}</h3>
              <div className="mt-3 space-y-1 text-sm">
                <p>File Type: {report.fileType}</p>
                <p>File Size: {report.fileSizeKb ?? '--'} KB</p>
                <p>Uploaded On: {new Date(report.createdAt).toLocaleString()}</p>
                <p>Patient: {report.patient?.fullName ?? '--'}</p>
              </div>
            </div>

            <div className="surface-soft p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Report Viewer</p>
              <div className="mt-3 flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-white">
                <p className="text-sm text-muted-foreground">
                  {report.fileType} preview shell with extraction-ready layout.
                </p>
              </div>
              <Button className="mt-3" onClick={() => extractionMutation.mutate()} disabled={extractionMutation.isPending}>
                {extractionMutation.isPending ? 'Extracting...' : 'Trigger Mock Extraction'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extracted Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="surface-soft p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-700">
                {extraction.extractedSummary ?? 'No extracted summary available yet.'}
              </p>
            </div>

            {extractedObject ? (
              <div className="surface-soft p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Parsed Medical Fields</p>
                <div className="mt-3 grid gap-2 text-sm">
                  <p>Blood Group: {String(extractedObject.bloodGroup ?? '--')}</p>
                  <p>Diagnosis: {String(extractedObject.diagnosis ?? '--')}</p>
                  <p>Urgency Hint: {String(extractedObject.urgencyHint ?? '--')}</p>
                  <p>Key Notes: {String(extractedObject.keyNotes ?? '--')}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
