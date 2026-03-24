import { Badge } from '@/components/ui/badge';
import { DonorStatus } from '@/lib/types/api';

const statusVariant: Record<DonorStatus, 'success' | 'warning' | 'neutral'> = {
  AVAILABLE: 'success',
  TEMP_UNAVAILABLE: 'warning',
  INACTIVE: 'neutral',
};

export function DonorStatusBadge({ status }: { status: DonorStatus }) {
  return <Badge variant={statusVariant[status]}>{status.replaceAll('_', ' ')}</Badge>;
}
