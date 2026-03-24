'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronDown, Filter, Sparkles } from 'lucide-react';
import { CreateMatchForm } from '@/components/matches/create-match-form';
import { MatchStatusBadge } from '@/components/matches/match-status-badge';
import { ScoreRing } from '@/components/matches/score-ring';
import { UrgencyBadge } from '@/components/matches/urgency-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { donorsApi, matchesApi, patientsApi } from '@/lib/api/endpoints';
import { MatchStatus } from '@/lib/types/api';
import { matchStatusOptions } from '@/lib/types/options';

const statusFilterOptions = [{ label: 'All statuses', value: 'ALL' }, ...matchStatusOptions];
const reviewActions = [
  { label: 'Review', action: 'REVIEW' as const, variant: 'outline' as const },
  { label: 'Shortlist', action: 'SHORTLIST' as const, variant: 'outline' as const },
  { label: 'Approve', action: 'APPROVE' as const, variant: 'default' as const },
  { label: 'Reject', action: 'REJECT' as const, variant: 'destructive' as const },
  { label: 'Notify', action: 'NOTIFY' as const, variant: 'secondary' as const },
];

export default function MatchesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'ALL' | MatchStatus>('ALL');
  const [expandedMatchIds, setExpandedMatchIds] = useState<string[]>([]);

  const matchesQuery = useQuery({
    queryKey: ['matches', statusFilter],
    queryFn: () => matchesApi.getAll(statusFilter === 'ALL' ? undefined : statusFilter),
  });

  const patientsQuery = useQuery({
    queryKey: ['patients'],
    queryFn: patientsApi.getAll,
  });

  const donorsQuery = useQuery({
    queryKey: ['donors'],
    queryFn: donorsApi.getAll,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MatchStatus }) => matchesApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-activities'] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'REVIEW' | 'SHORTLIST' | 'APPROVE' | 'REJECT' | 'NOTIFY' }) =>
      matchesApi.addReview(id, {
        action,
        note: `Manual ${action.toLowerCase()} action from coordinator workflow.`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-activities'] });
    },
  });

  const matches = useMemo(() => matchesQuery.data ?? [], [matchesQuery.data]);
  const criticalCount = matches.filter((match) => match.urgencyLevel === 'CRITICAL').length;

  if (matchesQuery.isLoading || patientsQuery.isLoading || donorsQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (matchesQuery.error || patientsQuery.error || donorsQuery.error || !patientsQuery.data || !donorsQuery.data) {
    return (
      <EmptyState
        icon={Filter}
        title="Unable to load match workflow"
        description="Please verify backend APIs and seeded demo data for patients, donors, and matches."
      />
    );
  }

  const toggleExpanded = (id: string) => {
    setExpandedMatchIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <PageTransition>
      <div className="space-y-5">
        <section className="surface-soft p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Match Workflow</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review compatibility scores, prioritize urgent cases, and trigger coordinator actions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <div className="w-48">
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as 'ALL' | MatchStatus)}
                  options={statusFilterOptions}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Total Matches</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{matches.length}</p>
            </div>
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Critical Urgency</p>
              <p className="mt-1 text-xl font-semibold text-critical">{criticalCount}</p>
            </div>
            <div className="surface p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">AI Review Ready</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Score-driven explanations enabled
              </p>
            </div>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Create Match</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateMatchForm
              patients={patientsQuery.data}
              donors={donorsQuery.data}
              onCreated={() => {
                queryClient.invalidateQueries({ queryKey: ['matches'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard-activities'] });
              }}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {matches.map((match, index) => {
            const score = Math.round(match.overallScore ?? match.compatibilityScore ?? 0);
            const scoreLabel = score >= 80 ? 'High Compatibility' : score >= 55 ? 'Moderate Compatibility' : 'Needs Review';
            const expanded = expandedMatchIds.includes(match.id);

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.18) }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="grid gap-4 xl:grid-cols-[auto_1fr_auto]">
                      <div className="flex flex-col items-center gap-2">
                        <ScoreRing score={score} />
                        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                          {scoreLabel}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <MatchStatusBadge status={match.status} />
                          {match.urgencyLevel ? <UrgencyBadge urgency={match.urgencyLevel} /> : null}
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="surface-soft p-3">
                            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Patient</p>
                            <p className="mt-1 font-semibold text-slate-900">{match.patient.fullName}</p>
                            <p className="text-xs text-muted-foreground">{match.patient.uhid}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {match.patient.organNeeded} | {match.patient.bloodGroup}
                            </p>
                          </div>
                          <div className="surface-soft p-3">
                            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Donor</p>
                            <p className="mt-1 font-semibold text-slate-900">{match.donor.fullName}</p>
                            <p className="text-xs text-muted-foreground">{match.donor.donorCode}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {match.donor.status} | {match.donor.bloodGroup}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-sky-50/50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">AI Explanation</p>
                          <p className="mt-1 text-sm text-slate-700">
                            {match.matchReason ?? 'Compatibility rationale will be generated here in advanced AI mode.'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 xl:w-56">
                        <div>
                          <p className="mb-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">Update Status</p>
                          <Select
                            value={match.status}
                            onChange={(value) =>
                              statusMutation.mutate({ id: match.id, status: value as MatchStatus })
                            }
                            options={matchStatusOptions}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {reviewActions.map((reviewAction) => (
                            <Button
                              key={reviewAction.action}
                              type="button"
                              size="sm"
                              variant={reviewAction.variant}
                              onClick={() =>
                                reviewMutation.mutate({ id: match.id, action: reviewAction.action })
                              }
                              disabled={reviewMutation.isPending}
                            >
                              {reviewAction.label}
                            </Button>
                          ))}
                        </div>
                        <Button asChild size="sm" variant="outline" className="w-full">
                          <Link href={`/matches/${match.id}`}>Open Detail View</Link>
                        </Button>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(match.id)}
                          className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600 hover:bg-muted/60"
                        >
                          {expanded ? 'Hide' : 'Expand'} breakdown
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {expanded ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="surface p-3">
                          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Blood Compatibility</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">
                            {match.bloodCompatibilityScore ?? '--'}%
                          </p>
                        </div>
                        <div className="surface p-3">
                          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Location Score</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">{match.locationScore ?? '--'}%</p>
                        </div>
                        <div className="surface p-3">
                          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Availability Score</p>
                          <p className="mt-1 text-lg font-semibold text-slate-900">
                            {match.availabilityScore ?? '--'}%
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {!matches.length ? (
          <EmptyState
            icon={Filter}
            title="No matches for selected filter"
            description="Adjust status filters or create a new donor-patient match."
          />
        ) : null}
      </div>
    </PageTransition>
  );
}
