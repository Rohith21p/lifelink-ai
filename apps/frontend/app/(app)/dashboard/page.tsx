'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Droplets,
  FileClock,
  FileSearch,
  GitPullRequestArrow,
  HeartPulse,
  Sparkles,
  Users,
} from 'lucide-react';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { MetricCard } from '@/components/dashboard/metric-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RequestsTrendChart } from '@/components/dashboard/requests-trend-chart';
import { StatusDistributionChart } from '@/components/dashboard/status-distribution-chart';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi } from '@/lib/api/endpoints';

export default function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
  });

  const activitiesQuery = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: dashboardApi.getRecentActivities,
  });

  const recentMatchActivityQuery = useQuery({
    queryKey: ['dashboard-recent-match-activity'],
    queryFn: dashboardApi.getRecentMatchActivity,
  });

  const lowStockQuery = useQuery({
    queryKey: ['dashboard-low-stock-alerts'],
    queryFn: dashboardApi.getLowStockAlerts,
  });

  const recentNotificationsQuery = useQuery({
    queryKey: ['dashboard-recent-notifications'],
    queryFn: dashboardApi.getRecentNotifications,
  });

  if (
    summaryQuery.isLoading ||
    activitiesQuery.isLoading ||
    recentMatchActivityQuery.isLoading ||
    lowStockQuery.isLoading ||
    recentNotificationsQuery.isLoading
  ) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
    );
  }

  if (
    summaryQuery.error ||
    activitiesQuery.error ||
    recentMatchActivityQuery.error ||
    lowStockQuery.error ||
    recentNotificationsQuery.error ||
    !summaryQuery.data ||
    !activitiesQuery.data ||
    !recentMatchActivityQuery.data ||
    !lowStockQuery.data ||
    !recentNotificationsQuery.data
  ) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Unable to load dashboard"
        description="We could not fetch dashboard metrics right now. Verify backend API availability and seeded demo data."
      />
    );
  }

  const summary = summaryQuery.data;

  const approvalRate =
    summary.totalMatches > 0 ? Math.round((summary.approvedMatches / summary.totalMatches) * 100) : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        <section className="surface-soft p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Executive Command Center</p>
              <h1 className="premium-title mt-1">Healthcare Coordination Overview</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Monitor live case load, matching progress, blood inventory risks, and coordination activity from a
                single investor-ready control surface.
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-panel">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Match Approval Health</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{approvalRate}%</p>
              <Progress value={approvalRate} className="mt-2 w-44" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total Patients" value={summary.totalPatients} subtitle="Registered across partner hospitals" icon={Users} />
          <MetricCard title="Total Donors" value={summary.totalDonors} subtitle="Verified + standby donor profiles" icon={HeartPulse} />
          <MetricCard title="Active Requests" value={summary.activeRequests} subtitle="Cases currently in clinical motion" icon={FileClock} />
          <MetricCard title="Urgent Cases" value={summary.urgentCases} subtitle="High or critical urgency requiring priority review" icon={AlertTriangle} />
          <MetricCard title="Total Matches" value={summary.totalMatches} subtitle="Rule-based + manual coordinator matches" icon={GitPullRequestArrow} />
          <MetricCard title="Pending Reviews" value={summary.pendingReviews} subtitle="Queued for coordinator decisions" icon={FileSearch} />
          <MetricCard title="Approved Matches" value={summary.approvedMatches} subtitle="Approved after panel review workflow" icon={CheckCircle2} />
          <MetricCard title="Uploaded Reports" value={summary.uploadedReportsCount} subtitle={`${summary.lowBloodStockAlerts} blood group alerts currently active`} icon={Droplets} />
        </section>

        <QuickActions />

        <section className="grid gap-4 xl:grid-cols-2">
          <RequestsTrendChart data={summary.monthlyTrend} />
          <StatusDistributionChart
            title="Patient Status Distribution"
            data={summary.patientStatusBreakdown.map((item) => ({
              status: item.status.replaceAll('_', ' '),
              count: item.count,
            }))}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <StatusDistributionChart
            title="Donor Status Distribution"
            data={summary.donorStatusBreakdown.map((item) => ({
              status: item.status.replaceAll('_', ' '),
              count: item.count,
            }))}
          />
          <ActivityFeed activities={activitiesQuery.data} />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Badge variant={lowStockQuery.data.length ? 'danger' : 'success'}>
                {lowStockQuery.data.length}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockQuery.data.slice(0, 5).map((item) => (
                <div key={item.id} className="surface-soft p-3">
                  <p className="text-sm font-semibold text-slate-900">{item.bloodBank?.name ?? 'Blood Bank'}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.bloodGroup}: {item.unitsAvailable} units (threshold {item.lowStockThreshold})
                  </p>
                </div>
              ))}
              {!lowStockQuery.data.length ? (
                <p className="text-sm text-muted-foreground">No low stock alerts currently.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Match Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentMatchActivityQuery.data.slice(0, 6).map((match) => (
                <div key={match.id} className="surface-soft p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {match.patient.fullName} <span className="text-muted-foreground">vs</span> {match.donor.fullName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Status: {match.status} | Score: {match.overallScore ?? match.compatibilityScore ?? '--'}%
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Notifications</CardTitle>
              <BellRing className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-2">
              {recentNotificationsQuery.data.slice(0, 6).map((notification) => (
                <div key={notification.id} className="surface-soft p-3">
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            AI Insight Ready
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This dashboard now surfaces premium visual cues and insight placeholders ready for future AI analytics panels.
          </p>
        </section>
      </div>
    </PageTransition>
  );
}
