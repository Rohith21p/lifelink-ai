import { Badge } from '@/components/ui/badge';
import { MatchStatus } from '@/lib/types/api';

const statusVariant: Record<MatchStatus, 'default' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'default',
  SHORTLISTED: 'warning',
  CONTACTED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'neutral',
};

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  return <Badge variant={statusVariant[status]}>{status.replaceAll('_', ' ')}</Badge>;
}
