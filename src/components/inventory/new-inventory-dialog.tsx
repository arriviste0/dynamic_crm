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
import { createInventoryItem, updateInventoryItem } from '@/app/actions/inventory';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

// Custom field helpers
function getCustomFields() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('customFields') || '[]');
  } catch {
    return [];
  }
}

function saveCustomFields(fields: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('customFields', JSON.stringify(fields));
  }
}

const inventorySchema = z.object({
  sku: z.string().min(2, 'SKU must be at least 2 characters.'),
  name: z.string().min(2, 'Item name must be at least 2 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  description: z.string().optional(),
  quantity: z.string().regex(/^\d+$/, 'Quantity must be a number.'),
  reorderLevel: z.string().regex(/^\d+$/, 'Reorder level must be a number.'),
  unitPrice: z.string().regex(/^\d+(\.\d{2})?$/, 'Unit price must be a valid amount.'),
  supplier: z.string().min(2, 'Supplier must be at least 2 characters.'),
  location: z.string().min(2, 'Location must be at least 2 characters.'),
  status: z.enum(['In Stock', 'Low Stock', 'Out of Stock', 'Discontinued']),
});

type InventoryItem = {
  _id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  supplier: string;
  location: string;
  status: string;
  [key: string]: any;
};

type NewInventoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemCreated: (item: any) => void;
  onItemUpdated: (item: any) => void;
  item: InventoryItem | null;
};

export function NewInventoryDialog({ open, onOpenChange, onItemCreated, onItemUpdated, item }: NewInventoryDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof inventorySchema>>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      sku: '',
      name: '',
      category: 'Electronics',
      description: '',
      quantity: '0',
      reorderLevel: '10',
      unitPrice: '0.00',
      supplier: '',
      location: '',
      status: 'In Stock',
    },
  });

  const [customFields, setCustomFields] = React.useState<any[]>([]);
  const [showAddField, setShowAddField] = React.useState(false);
  const [newField, setNewField] = React.useState({ name: '', type: 'text' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    setCustomFields(getCustomFields());
  }, [open]);

  useEffect(() => {
    if (item) {
      form.reset({
        sku: item.sku || '',
        name: item.name || '',
        category: item.category || 'Electronics',
        description: item.description || '',
        quantity: item.quantity?.toString() || '0',
        reorderLevel: item.reorderLevel?.toString() || '10',
        unitPrice: item.unitPrice?.toString() || '0.00',
        supplier: item.supplier || '',
        location: item.location || '',
        status: (item.status as any) || 'In Stock',
      });
    } else {
      form.reset({
        sku: '',
        name: '',
        category: 'Electronics',
        description: '',
        quantity: '0',
        reorderLevel: '10',
        unitPrice: '0.00',
        supplier: '',
        location: '',
        status: 'In Stock',
      });
    }
  }, [item, form, open]);

  const onSubmit = async (values: z.infer<typeof inventorySchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        const value = values[key as keyof typeof values];
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Add custom field values
      const inventoryCustomFields = customFields.filter(f => f.module === 'inventory');
      inventoryCustomFields.forEach(field => {
        const value = form.getValues(field.name as any);
        if (value !== undefined) {
          formData.append(field.name, value);
        }
      });

      let result;
      if (item) {
        result = await updateInventoryItem(item._id, formData);
      } else {
        result = await createInventoryItem(formData);
      }

      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        if (item) {
          onItemUpdated(values);
        } else {
          onItemCreated(values);
        }
        onOpenChange(false);
        form.reset();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Inventory Item' : 'New Inventory Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the inventory item details.' : 'Add a new item to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PROD-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level</FormLabel>
                    <FormControl>
                      <Input placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Warehouse A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="Discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Fields Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Custom Fields</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddField(!showAddField)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>

              {showAddField && (
                <div className="flex gap-2 mb-4 p-3 bg-muted rounded">
                  <Input
                    placeholder="Field name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  />
                  <select
                    className="border rounded px-2 py-1"
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newField.name.trim()) {
                        const updated = [...customFields, { ...newField, module: 'inventory' }];
                        setCustomFields(updated);
                        saveCustomFields(updated);
                        setNewField({ name: '', type: 'text' });
                        setShowAddField(false);
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}

              {customFields.filter(f => f.module === 'inventory').length === 0 && (
                <p className="text-sm text-muted-foreground">No custom fields yet.</p>
              )}

              {customFields.filter(f => f.module === 'inventory').map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as any}
                  render={({ field: formField }) => (
                    <FormItem className="mb-2">
                      <FormLabel>{field.name}</FormLabel>
                      <div className="flex gap-2">
                        <FormControl className="flex-1">
                          <Input
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            {...formField}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const updated = customFields.filter(f2 => !(f2.module === 'inventory' && f2.name === field.name));
                            setCustomFields(updated);
                            saveCustomFields(updated);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
