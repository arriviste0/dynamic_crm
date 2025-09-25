'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect } from 'react';
import { Product } from './columns';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters.'),
  sku: z.string().min(2, 'SKU must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  price: z.number().min(0, 'Price must be positive.'),
  costPrice: z.number().min(0, 'Cost price must be positive.'),
  stockLevel: z.number().min(0, 'Stock level must be non-negative.'),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock']),
  supplier: z.string().min(2, 'Supplier name must be at least 2 characters.'),
  tags: z.string().optional(),
});

type NewProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (product: any) => void;
  onProductUpdated: (product: any) => void;
  product: Product | null;
};

export function NewProductDialog({
  open,
  onOpenChange,
  onProductCreated,
  onProductUpdated,
  product
}: NewProductDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      category: '',
      price: 0,
      costPrice: 0,
      stockLevel: 0,
      status: 'In Stock',
      supplier: '',
      tags: '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        description: product.description,
        category: product.category,
        price: product.price,
        costPrice: product.costPrice,
        stockLevel: product.stockLevel,
        status: product.status,
        supplier: product.supplier,
        tags: product.tags?.join(', ') || '',
      });
    } else {
      form.reset({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: 0,
        costPrice: 0,
        stockLevel: 0,
        status: 'In Stock',
        supplier: '',
        tags: '',
      });
    }
  }, [product, form]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await fetch('/api/products' + (product ? `/${product._id}` : ''), {
        method: product ? 'PUT' : 'POST',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to save product');
      const savedProduct = await response.json();
      
      if (product) {
        onProductUpdated(savedProduct);
      } else {
        onProductCreated(savedProduct);
      }

      onOpenChange(false);
      toast({
        title: 'Success',
        description: `Product ${product ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogDescription>
          {product
            ? "Edit product details. Click save when you're done."
            : "Add a new product to your catalog. Fill in all required fields."}
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter product description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter price"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter cost price"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter stock level"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tags (comma separated)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Saving...'
                ) : product ? (
                  'Save Changes'
                ) : (
                  'Create Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
