import { Badge } from '@/components/ui/badge';
import { NotificationChannel } from '@/lib/types/api';

const channelVariant: Record<NotificationChannel, 'default' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  IN_APP: 'default',
  SMS: 'warning',
  EMAIL: 'success',
  WHATSAPP: 'neutral',
};

export function NotificationChannelBadge({ channel }: { channel: NotificationChannel }) {
  return <Badge variant={channelVariant[channel]}>{channel.replaceAll('_', ' ')}</Badge>;
}
