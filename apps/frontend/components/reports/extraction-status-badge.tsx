import { Badge } from '@/components/ui/badge';
import { ExtractionStatus } from '@/lib/types/api';

const statusVariant: Record<ExtractionStatus, 'default' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'neutral',
  PROCESSING: 'warning',
  COMPLETED: 'success',
  FAILED: 'danger',
};

export function ExtractionStatusBadge({ status }: { status: ExtractionStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
