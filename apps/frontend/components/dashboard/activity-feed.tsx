import { formatDistanceToNow } from 'date-fns';
import { Dot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem } from '@/lib/types/api';

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length ? (
          activities.map((activity) => (
            <div key={activity.id} className="surface-soft p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">{activity.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-1 inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                <Dot className="-mx-1 h-4 w-4" />
                {activity.category.replaceAll('_', ' ')}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{activity.description}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No activity found.</p>
        )}
      </CardContent>
    </Card>
  );
}
