'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { MatchStatusBadge } from '@/components/matches/match-status-badge';
import { ScoreRing } from '@/components/matches/score-ring';
import { UrgencyBadge } from '@/components/matches/urgency-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { matchesApi } from '@/lib/api/endpoints';
import { MatchStatus } from '@/lib/types/api';
import { matchReviewActionOptions, matchStatusOptions } from '@/lib/types/options';

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const matchQuery = useQuery({
    queryKey: ['match', params.id],
    queryFn: () => matchesApi.getById(params.id),
  });

  const scoreQuery = useQuery({
    queryKey: ['match-score', params.id],
    queryFn: () => matchesApi.getScoreBreakdown(params.id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: MatchStatus) => matchesApi.updateStatus(params.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', params.id] });
      queryClient.invalidateQueries({ queryKey: ['match-score', params.id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const actionMutation = useMutation({
    mutationFn: (action: 'REVIEW' | 'SHORTLIST' | 'APPROVE' | 'REJECT' | 'NOTIFY') =>
      matchesApi.addReview(params.id, {
        action,
        note: `Match action ${action.toLowerCase()} executed.`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', params.id] });
      queryClient.invalidateQueries({ queryKey: ['match-score', params.id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const score = useMemo(() => scoreQuery.data, [scoreQuery.data]);
  const match = matchQuery.data;

  if (matchQuery.isLoading || scoreQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (matchQuery.error || scoreQuery.error || !match || !score) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Unable to load match detail"
        description="Please retry after confirming backend API availability."
      />
    );
  }

  return (
    <PageTransition>
      <div className="space-y-5">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Match Detail</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Detailed compatibility profile for coordinator review and approval.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <MatchStatusBadge status={match.status} />
              {match.urgencyLevel ? <UrgencyBadge urgency={match.urgencyLevel} /> : null}
              <Badge variant="default">Overall {score.overallScore}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[auto_1fr]">
            <div className="flex items-center justify-center">
              <ScoreRing score={Math.round(score.overallScore)} size={120} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-soft p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Patient Summary</p>
                <h3 className="mt-2 text-base font-semibold">{match.patient.fullName}</h3>
                <p className="text-xs text-muted-foreground">{match.patient.uhid}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p>Blood Group: {match.patient.bloodGroup}</p>
                  <p>Needed: {match.patient.organNeeded}</p>
                  <p>Hospital: {match.patient.hospital?.name ?? '--'}</p>
                </div>
              </div>

              <div className="surface-soft p-4">
                <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Donor Summary</p>
                <h3 className="mt-2 text-base font-semibold">{match.donor.fullName}</h3>
                <p className="text-xs text-muted-foreground">{match.donor.donorCode}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p>Blood Group: {match.donor.bloodGroup}</p>
                  <p>Status: {match.donor.status}</p>
                  <p>Hospital: {match.donor.hospital?.name ?? '--'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Blood Compatibility: {score.bloodCompatibilityScore}%</p>
              <p>Location Score: {score.locationScore}%</p>
              <p>Availability Score: {score.availabilityScore}%</p>
              <p className="font-semibold text-primary">Overall Score: {score.overallScore}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Review Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">Update Status</p>
                <Select
                  value={match.status}
                  onChange={(value) => statusMutation.mutate(value as MatchStatus)}
                  options={matchStatusOptions}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {matchReviewActionOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant={option.value === 'APPROVE' ? 'default' : option.value === 'REJECT' ? 'destructive' : 'outline'}
                    onClick={() =>
                      actionMutation.mutate(option.value as 'REVIEW' | 'SHORTLIST' | 'APPROVE' | 'REJECT' | 'NOTIFY')
                    }
                    disabled={actionMutation.isPending}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Explanation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{match.matchReason ?? 'Compatibility rationale is pending detailed AI explanation.'}</p>
              <p>Review notes: {score.reviewNotes ?? 'No review notes yet.'}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Review Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {match.reviews?.length ? (
              match.reviews.map((review) => (
                <div key={review.id} className="surface-soft p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral">{review.action}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{review.note ?? 'No review note provided.'}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No review notes yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
