'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BrainCircuit, CircleAlert, Droplets, FileSearch, Sparkles } from 'lucide-react';
import { dashboardApi } from '@/lib/api/endpoints';
import { useDemoStore } from '@/lib/stores/demo-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function AiInsightPanel() {
  const { role } = useDemoStore();
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
  });

  const insightItems = useMemo(() => {
    const summary = summaryQuery.data;
    if (!summary) {
      return [];
    }

    const approvalRatio =
      summary.totalMatches > 0 ? Math.round((summary.approvedMatches / summary.totalMatches) * 100) : 0;

    return [
      {
        label: 'Match Approval Confidence',
        value: `${approvalRatio}%`,
        progress: approvalRatio,
        icon: Sparkles,
        description: 'Based on shortlist-to-approval conversion from demo workflow.',
      },
      {
        label: 'Review Queue Pressure',
        value: `${summary.pendingReviews}`,
        progress: Math.min(100, summary.pendingReviews * 12),
        icon: FileSearch,
        description: 'Pending review load indicating panel attention needed.',
      },
      {
        label: 'Blood Stock Risk',
        value: `${summary.lowBloodStockAlerts} alerts`,
        progress: Math.min(100, summary.lowBloodStockAlerts * 18),
        icon: Droplets,
        description: 'Low-stock signals from blood bank inventory thresholds.',
      },
    ];
  }, [summaryQuery.data]);

  return (
    <aside className="hidden h-screen min-w-[21rem] border-l border-border/70 bg-white/85 px-4 py-6 backdrop-blur-xl xl:block">
      <div className="space-y-4">
        <Card className="surface-soft border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BrainCircuit className="h-4 w-4 text-primary" />
                AI Insight Panel
              </CardTitle>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                DEMO MODE
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Role-focused insight preview for {role.toLowerCase()} workflows.</p>
            <p className="text-xs">ML intelligence will replace these heuristic insights in future steps.</p>
          </CardContent>
        </Card>

        {summaryQuery.data ? (
          insightItems.map((insight) => {
            const Icon = insight.icon;
            return (
              <Card key={insight.label}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{insight.label}</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">{insight.value}</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <Progress value={insight.progress} />
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Insight data is syncing from the dashboard service.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Suggested Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link className="block rounded-lg bg-muted/50 px-3 py-2 hover:bg-muted" href="/matches">
              Prioritize critical match reviews
            </Link>
            <Link className="block rounded-lg bg-muted/50 px-3 py-2 hover:bg-muted" href="/reports">
              Validate extracted report summaries
            </Link>
            <Link className="block rounded-lg bg-muted/50 px-3 py-2 hover:bg-muted" href="/blood-banks">
              Resolve low stock blood groups
            </Link>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-warning/25 bg-warning/10 p-3 text-xs text-amber-700">
          <p className="flex items-center gap-1.5 font-semibold">
            <CircleAlert className="h-3.5 w-3.5" />
            Intelligence Placeholder
          </p>
          <p className="mt-1">
            This panel uses deterministic demo heuristics and is ready for future AI service integration.
          </p>
        </div>
      </div>
    </aside>
  );
}
