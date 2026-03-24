'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { NotificationChannelBadge } from '@/components/notifications/notification-channel-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { PageTransition } from '@/components/ui/page-transition';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationsApi } from '@/lib/api/endpoints';
import { Notification, NotificationLog, NotificationTemplate } from '@/lib/types/api';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll({ limit: 40 }),
  });

  const templatesQuery = useQuery({
    queryKey: ['notification-templates'],
    queryFn: notificationsApi.getTemplates,
  });

  const logsQuery = useQuery({
    queryKey: ['notification-logs'],
    queryFn: () => notificationsApi.getLogs(40),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  if (notificationsQuery.isLoading || templatesQuery.isLoading || logsQuery.isLoading) {
    return <Skeleton className="h-80" />;
  }

  if (
    notificationsQuery.error ||
    templatesQuery.error ||
    logsQuery.error ||
    !notificationsQuery.data ||
    !templatesQuery.data ||
    !logsQuery.data
  ) {
    return (
      <EmptyState
        icon={Bell}
        title="Unable to load notifications"
        description="Please verify notification APIs and seeded data."
      />
    );
  }

  return (
    <PageTransition>
      <div className="space-y-5">
        <section className="surface-soft p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Notifications Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Unified in-app notification inbox with template visibility and delivery logs.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Notification Inbox</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<Notification>
              data={notificationsQuery.data}
              searchable
              searchPlaceholder="Search by title, message, channel..."
              searchBy={(item) => `${item.title} ${item.message} ${item.channel}`}
              rowKey={(item) => item.id}
              columns={[
                {
                  key: 'title',
                  header: 'Notification',
                  sortable: true,
                  sortValue: (item) => item.title,
                  render: (item) => (
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.message}</p>
                    </div>
                  ),
                },
                {
                  key: 'channel',
                  header: 'Channel',
                  render: (item) => <NotificationChannelBadge channel={item.channel} />,
                },
                {
                  key: 'status',
                  header: 'Read',
                  render: (item) => <Badge variant={item.isRead ? 'neutral' : 'warning'}>{item.isRead ? 'Read' : 'Unread'}</Badge>,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (item) =>
                    item.isRead ? (
                      <span className="text-xs text-muted-foreground">Marked</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markReadMutation.mutate(item.id)}
                        disabled={markReadMutation.isPending}
                      >
                        Mark Read
                      </Button>
                    ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable<NotificationTemplate>
                data={templatesQuery.data}
                rowKey={(item) => item.id}
                columns={[
                  {
                    key: 'name',
                    header: 'Name',
                    render: (item) => <p className="font-semibold text-slate-900">{item.name}</p>,
                  },
                  {
                    key: 'event',
                    header: 'Event',
                    render: (item) => <p className="text-xs text-muted-foreground">{item.eventType}</p>,
                  },
                  {
                    key: 'channel',
                    header: 'Channel',
                    render: (item) => <NotificationChannelBadge channel={item.channel} />,
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable<NotificationLog>
                data={logsQuery.data}
                rowKey={(item) => item.id}
                columns={[
                  {
                    key: 'message',
                    header: 'Message',
                    render: (item) => <p className="text-sm text-slate-700">{item.message}</p>,
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (item) => (
                      <Badge variant={item.status === 'SENT' ? 'success' : item.status === 'FAILED' ? 'danger' : 'warning'}>
                        {item.status}
                      </Badge>
                    ),
                  },
                  {
                    key: 'channel',
                    header: 'Channel',
                    render: (item) => <NotificationChannelBadge channel={item.channel} />,
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
