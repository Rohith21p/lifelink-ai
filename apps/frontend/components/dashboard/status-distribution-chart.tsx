'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const palette = ['#0284c7', '#0f766e', '#f59e0b', '#ef4444', '#64748b', '#0891b2'];

type BreakdownItem = {
  status: string;
  count: number;
};

export function StatusDistributionChart({
  title,
  data,
}: {
  title: string;
  data: BreakdownItem[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={58} outerRadius={86} paddingAngle={4}>
              {data.map((item, index) => (
                <Cell key={item.status} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, label: string) => [`${value}`, label.replaceAll('_', ' ')]}
              contentStyle={{
                borderRadius: 12,
                borderColor: '#dbe6f4',
                boxShadow: '0 14px 28px -22px rgba(15,23,42,0.45)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
