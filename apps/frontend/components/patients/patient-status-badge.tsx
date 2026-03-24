import { Badge } from '@/components/ui/badge';
import { CaseStatus } from '@/lib/types/api';

const statusVariant: Record<CaseStatus, 'default' | 'warning' | 'success' | 'neutral'> = {
  NEW: 'default',
  UNDER_REVIEW: 'warning',
  MATCHING: 'warning',
  TRANSPLANT_SCHEDULED: 'success',
  CLOSED: 'neutral',
};

export function PatientStatusBadge({ status }: { status: CaseStatus }) {
  return <Badge variant={statusVariant[status]}>{status.replaceAll('_', ' ')}</Badge>;
}
