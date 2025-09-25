'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NewProductDialog } from './new-product-dialog';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleProductCreated = (newProduct: any) => {
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: 'Success',
      description: 'Product created successfully.',
    });
  };

  const handleProductUpdated = (updatedProduct: any) => {
    setProducts(prev =>
      prev.map(product => (product._id === updatedProduct._id ? updatedProduct : product))
    );
    toast({
      title: 'Success',
      description: 'Product updated successfully.',
    });
  };

  return (
    <div className="h-full p-4 space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            A list of all your products, including details and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={products}
            loading={isLoading}
            onRowClick={(row) => {
              setSelectedProduct(row.original);
              setDialogOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <NewProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onProductCreated={handleProductCreated}
        onProductUpdated={handleProductUpdated}
        product={selectedProduct}
      />
    </div>
  );
}
