import React from 'react';
import { cn } from '@/lib/utils';
import Text from './Text';
import { Button } from './Button';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  variant?: 'default' | 'striped' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  idField?: keyof T;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  sortConfig,
  onSort,
  pagination,
  loading = false,
  emptyMessage = 'No data available',
  className,
  variant = 'default',
  size = 'md',
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  idField = 'id'
}: DataTableProps<T>) {
  const variants = {
    default: 'bg-token-surface',
    striped: 'bg-token-surface [&>tbody>tr:nth-child(even)]:bg-token-surface-subtle',
    bordered: 'bg-token-surface border border-token-surface-alt'
  };

  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const cellSizes = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedItems.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(item => String(item[idField])));
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (!onSelectionChange) return;
    
    const newSelected = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];
    
    onSelectionChange(newSelected);
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-token-text-muted" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-token-primary" />
      : <ChevronDown className="w-4 h-4 text-token-primary" />;
  };

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="bg-token-surface rounded-lg overflow-hidden">
          <div className="h-12 bg-token-surface-subtle"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-token-surface-subtle border-t border-token-surface-alt"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'rounded-lg overflow-hidden',
        variants[variant]
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-token-surface-subtle">
              <tr>
                {selectable && (
                  <th className={cn(
                    'text-left font-medium text-token-text-secondary',
                    cellSizes[size]
                  )}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-token-surface-alt text-token-primary focus:ring-token-primary"
                      aria-label="Select all items"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'text-left font-medium text-token-text-secondary',
                      cellSizes[size],
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer hover:bg-token-surface-alt',
                      column.width && `w-${column.width}`
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                    role={column.sortable ? 'button' : undefined}
                    tabIndex={column.sortable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(column.key);
                      }
                    }}
                  >
                    <div className={cn(
                      'flex items-center gap-2',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}>
                      <Text variant="small" className="font-medium">
                        {column.header}
                      </Text>
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className={cn(
                      'text-center py-12 text-token-text-muted',
                      cellSizes[size]
                    )}
                  >
                    <Text variant="body" className="text-token-text-muted">
                      {emptyMessage}
                    </Text>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={String(item[idField])}
                    className={cn(
                      'border-t border-token-surface-alt hover:bg-token-surface-subtle transition-colors',
                      selectedItems.includes(String(item[idField])) && 'bg-token-primary-light'
                    )}
                  >
                    {selectable && (
                      <td className={cellSizes[size]}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(String(item[idField]))}
                          onChange={() => handleSelectItem(String(item[idField]))}
                          className="rounded border-token-surface-alt text-token-primary focus:ring-token-primary"
                          aria-label={`Select ${item[idField]}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          cellSizes[size],
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render 
                          ? column.render(item, index)
                          : <Text variant="body">{item[column.key]}</Text>
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <Text variant="small" className="text-token-text-secondary">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </Text>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const page = i + 1;
                const isCurrent = page === pagination.currentPage;
                const isNearCurrent = Math.abs(page - pagination.currentPage) <= 1;
                const isFirst = page === 1;
                const isLast = page === pagination.totalPages;
                
                if (isCurrent || isNearCurrent || isFirst || isLast) {
                  return (
                    <Button
                      key={page}
                      variant={isCurrent ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => pagination.onPageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                } else if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                  return (
                    <span key={page} className="px-2 text-token-text-muted">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 