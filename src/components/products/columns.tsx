'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export type Product = {
  _id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  stockLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  supplier: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Product Name',
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => formatCurrency(row.getValue('price')),
  },
  {
    accessorKey: 'stockLevel',
    header: 'Stock Level',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      let variant: 'default' | 'destructive' | 'secondary' | 'outline' = 'default';
      
      switch (status) {
        case 'In Stock':
          variant = 'default';
          break;
        case 'Low Stock':
          variant = 'secondary';
          break;
        case 'Out of Stock':
          variant = 'destructive';
          break;
      }

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'supplier',
    header: 'Supplier',
  },
];
