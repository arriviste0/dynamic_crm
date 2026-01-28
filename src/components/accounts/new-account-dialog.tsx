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
import { createAccount, updateAccount } from '@/app/actions/accounts';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react';
// Helper to load and save custom fields in localStorage (for demo; replace with API/backend later)
function loadCustomFields() {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('customFields');
      if (data) return JSON.parse(data);
    } catch {}
  }
  return [];
}
function saveCustomFields(fields: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('customFields', JSON.stringify(fields));
  }
}
import { Account } from '@/lib/types';

const accountSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  industry: z.string().min(2, 'Industry must be at least 2 characters.'),
  website: z.string().url('Please enter a valid website URL.').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  address: z.object({
    street: z.string().min(2, 'Street address is required.'),
    city: z.string().min(2, 'City is required.'),
    state: z.string().min(2, 'State is required.'),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 characters.'),
    country: z.string().min(2, 'Country is required.'),
  }),
  description: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Prospect', 'Customer']),
});

type NewAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountCreated: (account: any) => void;
  onAccountUpdated: (account: any) => void;
  account: Account | null;
};

export function NewAccountDialog({ open, onOpenChange, onAccountCreated, onAccountUpdated, account }: NewAccountDialogProps) {
  const [customFields, setCustomFields] = useState<{ name: string; type: string; module: string }[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<{ name: string; type: string }>({ name: '', type: 'text' });
  const { toast } = useToast();
  // Extend form schema to include custom fields dynamically
  const customFieldDefaults = React.useMemo(() => 
    customFields.filter(f => f.module === 'accounts').reduce((acc, f) => ({ ...acc, [f.name]: '' }), {} as Record<string, string>
  ), [customFields]);
  
  const form = useForm<any>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      website: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      description: '',
      status: 'Prospect',
      ...customFieldDefaults,
    },
  });

  useEffect(() => {
    setCustomFields(loadCustomFields());
  }, [open]);

  useEffect(() => {
    if (account) {
      form.reset({
        companyName: account.companyName,
        industry: account.industry,
        website: account.website,
        phone: account.phone,
        email: account.email,
        address: account.address,
        description: account.description,
        status: account.status,
        ...customFieldDefaults,
      });
    } else {
      form.reset({
        companyName: '',
        industry: '',
        website: '',
        phone: '',
        email: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        description: '',
        status: 'Prospect',
        ...customFieldDefaults,
      });
    }
    // eslint-disable-next-line
  }, [account, form, open, customFields]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: z.infer<typeof accountSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Flatten the address object for form data
    Object.entries(values.address).forEach(([key, value]) => {
      formData.append(`address.${key}`, value);
    });
    
    // Add other fields
    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'address') {
        formData.append(key, value as string);
      }
    });

    // Add custom field values directly from form state
    const accountCustomFields = customFields.filter(f => f.module === 'accounts');
    accountCustomFields.forEach(field => {
      const fieldValue = form.getValues(field.name);
      if (fieldValue && fieldValue.trim() !== '') {
        formData.append(field.name, fieldValue);
      }
    });

    const result = account 
        ? await updateAccount(account._id, formData) 
        : await createAccount(formData);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
      if (account) {
        onAccountUpdated(result);
      } else {
        onAccountCreated(result);
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

  const dialogTitle = account ? "Edit Account" : "Create New Account";
  const dialogDescription = account ? "Update the details of your account." : "Fill in the details below to create a new account.";
  const buttonText = account ? "Save Changes" : "Create Account";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>
          {dialogDescription}
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <FormControl>
                      <Input placeholder="Technology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Prospect">Prospect</SelectItem>
                        <SelectItem value="Customer">Customer</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Textarea 
                      placeholder="Brief description of the company..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      const updated = [...customFields, { ...newField, module: 'accounts' }];
                      setCustomFields(updated);
                      saveCustomFields(updated);
                      setNewField({ name: '', type: 'text' });
                      setShowAddField(false);
                    }}
                  >Save</Button>
                </div>
              )}
              <ul className="space-y-1">
                {customFields.filter(f => f.module === 'accounts').length === 0 && (
                  <li className="text-muted-foreground text-xs">No custom fields yet.</li>
                )}
                {customFields.filter(f => f.module === 'accounts').map((field) => (
                  <li key={field.name} className="flex items-center gap-2">
                    <span className="font-mono text-xs">{field.name}</span>
                    <span className="text-xs text-muted-foreground">({field.type})</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const updated = customFields.filter(f2 => !(f2.module === 'accounts' && f2.name === field.name));
                        setCustomFields(updated);
                        saveCustomFields(updated);
                      }}
                    >Delete</Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Render custom fields dynamically */}
            {customFields.filter(f => f.module === 'accounts').map(field => (
              <FormField
                key={`${field.name}-${field.type}`}
                control={form.control}
                name={field.name}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel>{field.name}</FormLabel>
                    <FormControl>
                      {field.type === 'text' ? (
                        <Input 
                          {...f} 
                          placeholder={field.name}
                          value={f.value || ''}
                          onChange={f.onChange}
                        />
                      ) : field.type === 'number' ? (
                        <Input 
                          {...f} 
                          type="number" 
                          placeholder={field.name}
                          value={f.value || ''}
                          onChange={f.onChange}
                        />
                      ) : field.type === 'date' ? (
                        <Input 
                          {...f} 
                          type="date" 
                          placeholder={field.name}
                          value={f.value || ''}
                          onChange={f.onChange}
                        />
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
