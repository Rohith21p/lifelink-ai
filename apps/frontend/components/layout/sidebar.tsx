'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity,
  Bell,
  ChevronLeft,
  X,
  Droplets,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { useUiStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/donors', label: 'Donors', icon: HeartHandshake },
  { href: '/matches', label: 'Matches', icon: Activity },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/blood-banks', label: 'Blood Banks', icon: Droplets },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

type SidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
  className?: string;
};

export function Sidebar({
  mobile = false,
  onNavigate,
  onClose,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUiStore();
  const collapsed = mobile ? false : sidebarCollapsed;

  return (
    <motion.aside
      initial={false}
      animate={mobile ? { x: 0 } : { width: collapsed ? 88 : 288 }}
      transition={{ duration: 0.22 }}
      className={cn(
        mobile
          ? 'flex min-h-screen w-[min(82vw,320px)] border-r border-border/70 bg-white/95 p-4 backdrop-blur-xl'
          : 'hidden min-h-screen border-r border-border/70 bg-white/90 p-4 backdrop-blur-xl lg:flex',
        className,
      )}
    >
      <div className="flex w-full flex-col">
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary via-sky-600 to-secondary p-4 text-white shadow-glow">
          <div className="flex items-start justify-between">
            {!collapsed ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/80">LifeLink AI</p>
                <h1 className="mt-1 text-lg font-semibold">Care Coordination OS</h1>
              </div>
            ) : (
              <p className="text-lg font-bold tracking-wide">LL</p>
            )}
            {mobile ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white/20 p-1.5 text-white/95 transition-colors hover:bg-white/30"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                className="rounded-lg bg-white/20 p-1.5 text-white/95 transition-colors hover:bg-white/30"
                aria-label="Toggle sidebar"
              >
                <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed ? 'rotate-180' : '')} />
              </button>
            )}
          </div>
          {!collapsed ? (
            <p className="mt-2 text-xs leading-relaxed text-white/85">
              Smart patient, donor, and hospital workflow orchestration.
            </p>
          ) : null}
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={onNavigate}
                className={cn(
                  'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  collapsed ? 'justify-center' : 'gap-3',
                  active
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                <Icon className={cn('h-[18px] w-[18px]', active ? 'text-white' : 'text-slate-500 group-hover:text-slate-700')} />
                {!collapsed ? item.label : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-dashed border-border bg-muted/35 p-3 text-xs leading-relaxed text-muted-foreground">
          {!collapsed ? (
            <>
              <p className="font-semibold text-slate-700">Step 3 Design Layer</p>
              <p className="mt-1">Premium UI polish, improved workflows, and investor-demo visual refinement.</p>
            </>
          ) : (
            <p className="text-center font-semibold text-slate-700">S3</p>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
