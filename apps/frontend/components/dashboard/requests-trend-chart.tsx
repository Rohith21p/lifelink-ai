'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TrendItem = {
  month: string;
  requests: number;
  donations: number;
};

export function RequestsTrendChart({ data }: { data: TrendItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Requests vs Donations</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                borderColor: '#dbe6f4',
                boxShadow: '0 14px 28px -22px rgba(15,23,42,0.45)',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#0284c7" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="donations" stroke="#0f766e" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
