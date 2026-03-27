'use client';

import { ReactNode, useMemo, useState } from 'react';
import { ArrowDownUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

type SortDirection = 'asc' | 'desc';

type Column<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string;
  emptyLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchBy?: (item: T) => string;
  className?: string;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyLabel = 'No records found',
  searchable = false,
  searchPlaceholder = 'Search records...',
  searchBy,
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState<{ key: string; direction: SortDirection } | null>(null);

  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return data;
    }

    const normalizedQuery = searchTerm.toLowerCase();
    return data.filter((item) => {
      const haystack = searchBy ? searchBy(item) : JSON.stringify(item);
      return haystack.toLowerCase().includes(normalizedQuery);
    });
  }, [data, searchBy, searchable, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortState) {
      return filteredData;
    }

    const column = columns.find((item) => item.key === sortState.key);
    if (!column) {
      return filteredData;
    }

    const readSortValue =
      column.sortValue ??
      ((item: T) => {
        const value = (item as unknown as Record<string, unknown>)[column.key];
        if (typeof value === 'number' || typeof value === 'string') {
          return value;
        }
        return '';
      });

    const sorted = [...filteredData].sort((a, b) => {
      const left = readSortValue(a);
      const right = readSortValue(b);

      if (left === right) {
        return 0;
      }

      if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
      }

      return String(left).localeCompare(String(right));
    });

    return sortState.direction === 'asc' ? sorted : sorted.reverse();
  }, [columns, filteredData, sortState]);

  return (
    <div className={cn('space-y-3', className)}>
      {searchable ? (
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md',
                    column.sortable ? 'cursor-pointer hover:text-slate-700' : 'cursor-default',
                  )}
                  onClick={() => {
                    if (!column.sortable) {
                      return;
                    }

                    setSortState((current) => {
                      if (!current || current.key !== column.key) {
                        return { key: column.key, direction: 'asc' };
                      }

                      return {
                        key: column.key,
                        direction: current.direction === 'asc' ? 'desc' : 'asc',
                      };
                    });
                  }}
                >
                  {column.header}
                  {column.sortable ? <ArrowDownUp className="h-3.5 w-3.5 opacity-70" /> : null}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length ? (
            sortedData.map((item) => (
              <TableRow key={rowKey(item)}>
                {columns.map((column) => (
                  <TableCell key={`${rowKey(item)}-${column.key}`} className={column.className}>
                    {column.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                {emptyLabel}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
