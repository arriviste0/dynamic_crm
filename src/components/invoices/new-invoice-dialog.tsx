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
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createInvoice, updateInvoice } from '@/app/actions/invoices';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect } from 'react';
// Custom field state helpers
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

import { Invoice } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

const invoiceSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters.'),
  customerEmail: z.string().email('Valid email is required.'),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']),
  dueDate: z.string().min(1, 'Due date is required.'),
  notes: z.string().optional(),
  items: z.array(z.object({
    type: z.enum(['Product', 'Service']),
    name: z.string().min(2, 'Item name is required.'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1.'),
    unitPrice: z.number().min(0, 'Unit price must be positive.'),
  })).min(1, 'At least one item is required.'),
});

type NewInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated: (invoice: any) => void;
  onInvoiceUpdated: (invoice: any) => void;
  invoice: Invoice | null;
};

export function NewInvoiceDialog({ open, onOpenChange, onInvoiceCreated, onInvoiceUpdated, invoice }: NewInvoiceDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      status: 'Draft',
      dueDate: '',
      notes: '',
      items: [{ type: 'Product', name: '', description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  // Custom fields state (must be inside component)
  const [customFields, setCustomFields] = React.useState<any[]>([]);
  const [showAddField, setShowAddField] = React.useState(false);
  const [newField, setNewField] = React.useState({ name: '', type: 'text' });

  useEffect(() => {
    setCustomFields(getCustomFields());
  }, [open]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (invoice) {
      form.reset({
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        status: invoice.status,
        dueDate: typeof invoice.dueDate === 'string' ? invoice.dueDate : invoice.dueDate?.toISOString().slice(0, 10) || '',
        notes: invoice.notes || '',
        items: invoice.items.map(item => ({
          type: item.type,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    } else {
      form.reset({
        customerName: '',
        customerEmail: '',
        status: 'Draft',
        dueDate: '',
        notes: '',
        items: [{ type: 'Product', name: '', description: '', quantity: 1, unitPrice: 0 }],
      });
    }
  }, [invoice, form, open]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Add basic fields
    formData.append('customerName', values.customerName);
    formData.append('customerEmail', values.customerEmail);
    formData.append('status', values.status);
    formData.append('dueDate', values.dueDate);
    formData.append('notes', values.notes || '');

    // Add items
    values.items.forEach((item, index) => {
      formData.append(`items.${index}.type`, item.type);
      formData.append(`items.${index}.name`, item.name);
      formData.append(`items.${index}.description`, item.description || '');
      formData.append(`items.${index}.quantity`, item.quantity.toString());
      formData.append(`items.${index}.unitPrice`, item.unitPrice.toString());
    });

    const result = invoice 
        ? await updateInvoice(invoice._id, formData) 
        : await createInvoice(formData);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
      if (invoice) {
        onInvoiceUpdated(result);
      } else {
        onInvoiceCreated(result);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
    setIsSubmitting(false);
  };

  const dialogTitle = invoice ? "Edit Invoice" : "Create New Invoice";
  const dialogDescription = invoice ? "Update the details of your invoice." : "Fill in the details below to create a new invoice.";
  const buttonText = invoice ? "Save Changes" : "Create Invoice";

  const addItem = () => {
    append({ type: 'Product', name: '', description: '', quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>
          {dialogDescription}
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes for this invoice..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Invoice Items</h4>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Item {index + 1}</h5>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Product">Product</SelectItem>
                              <SelectItem value="Service">Service</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Item name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Item description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Price *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <div className="w-full p-2 text-sm bg-muted rounded-md">
                        Total: ${(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unitPrice`)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Fields Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Custom Fields</span>
                <Button type="button" size="sm" onClick={() => setShowAddField(v => !v)}>
                  {showAddField ? 'Cancel' : 'Add Field'}
                </Button>
              </div>
              {showAddField && (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Field name"
                    value={newField.name}
                    onChange={e => setNewField(f => ({ ...f, name: e.target.value }))}
                  />
                  <select
                    className="border rounded px-2 py-1"
                    value={newField.type}
                    onChange={e => setNewField(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!newField.name.trim()) return;
                      const updated = [...customFields, { ...newField, module: 'invoices' }];
                      setCustomFields(updated);
                      saveCustomFields(updated);
                      setNewField({ name: '', type: 'text' });
                      setShowAddField(false);
                    }}
                  >Save</Button>
                </div>
              )}
              <ul className="space-y-1">
                {customFields.filter(f => f.module === 'invoices').length === 0 && (
                  <li className="text-muted-foreground text-xs">No custom fields yet.</li>
                )}
                {customFields.filter(f => f.module === 'invoices').map((field) => (
                  <li key={field.name} className="flex items-center gap-2">
                    <span className="font-mono text-xs">{field.name}</span>
                    <span className="text-xs text-muted-foreground">({field.type})</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const updated = customFields.filter(f2 => !(f2.module === 'invoices' && f2.name === field.name));
                        setCustomFields(updated);
                        saveCustomFields(updated);
                      }}
                    >Delete</Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Render custom fields dynamically */}
            {customFields.filter(f => f.module === 'invoices').map(field => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>{field.name}</FormLabel>
                    <FormControl>
                      {field.type === 'text' ? (
                        <Input {...f} placeholder={field.name} />
                      ) : field.type === 'number' ? (
                        <Input {...f} type="number" placeholder={field.name} />
                      ) : field.type === 'date' ? (
                        <Input {...f} type="date" placeholder={field.name} />
                      ) : null}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : buttonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

