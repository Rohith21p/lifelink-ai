'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Droplets, FileScan, Heart, UserPlus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const actions = [
  {
    title: 'Register New Patient',
    description: 'Capture demographics, urgency, and guardian profile.',
    href: '/patients/new',
    icon: UserPlus,
  },
  {
    title: 'Add New Donor',
    description: 'Onboard availability, screening, and donation preferences.',
    href: '/donors/new',
    icon: Heart,
  },
  {
    title: 'Review Match Queue',
    description: 'Open compatibility decisions and approval workflow.',
    href: '/matches',
    icon: Users,
  },
  {
    title: 'Analyze Reports',
    description: 'Upload files and inspect extraction summaries.',
    href: '/reports',
    icon: FileScan,
  },
  {
    title: 'Monitor Blood Stock',
    description: 'Resolve low-stock alerts across blood groups.',
    href: '/blood-banks',
    icon: Droplets,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                href={action.href}
                className="group surface-soft block p-4 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{action.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{action.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
