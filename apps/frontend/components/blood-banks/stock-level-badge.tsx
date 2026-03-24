import { Badge } from '@/components/ui/badge';

export function StockLevelBadge({ units, threshold }: { units: number; threshold: number }) {
  if (units <= threshold) {
    return <Badge variant="danger">Low Stock</Badge>;
  }

  if (units <= threshold * 1.5) {
    return <Badge variant="warning">Watch</Badge>;
  }

  return <Badge variant="success">Healthy</Badge>;
}
