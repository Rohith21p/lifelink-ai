import { Badge } from '@/components/ui/badge';
import { UrgencyLevel } from '@/lib/types/api';

const urgencyVariant: Record<UrgencyLevel, 'default' | 'warning' | 'danger' | 'neutral' | 'success'> = {
  LOW: 'neutral',
  MEDIUM: 'default',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  return <Badge variant={urgencyVariant[urgency]}>{urgency}</Badge>;
}
