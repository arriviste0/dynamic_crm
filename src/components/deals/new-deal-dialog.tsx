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
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createDeal, updateDeal } from '@/app/actions/deals';
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

const dealSchema = z.object({
  dealName: z.string().min(2, 'Deal name must be at least 2 characters.'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
  amount: z.string().regex(/^\$?\d+(,\d{3})*(\.\d{2})?$/, 'Please enter a valid amount.'),
  stage: z.enum(['Prospect', 'Qualifying', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
});

type Deal = {
  _id: string;
  dealName: string;
  companyName: string;
  amount: string;
  stage: string;
};

type NewDealDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDealCreated: (deal: any) => void;
  onDealUpdated: (deal: any) => void;
  deal: Deal | null;
};

export function NewDealDialog({ open, onOpenChange, onDealCreated, onDealUpdated, deal }: NewDealDialogProps) {
  const [customFields, setCustomFields] = useState<{ name: string; type: string; module: string }[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<{ name: string; type: string }>({ name: '', type: 'text' });
  const { toast } = useToast();
  // Extend form schema to include custom fields dynamically
  const customFieldDefaults = customFields.filter(f => f.module === 'deals').reduce((acc, f) => ({ ...acc, [f.name]: '' }), {} as Record<string, string>);
  const form = useForm<any>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      dealName: '',
      companyName: '',
      amount: '',
      stage: 'Prospect',
      ...customFieldDefaults,
    },
  });

  useEffect(() => {
    setCustomFields(loadCustomFields());
  }, [open]);

  useEffect(() => {
    if (deal) {
      form.reset({ ...deal, ...customFieldDefaults });
    } else {
      form.reset({
        dealName: '',
        companyName: '',
        amount: '',
        stage: 'Prospect',
        ...customFieldDefaults,
      });
    }
    // eslint-disable-next-line
  }, [deal, form, open, customFields]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: z.infer<typeof dealSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add custom field values directly from form state
    const dealCustomFields = customFields.filter(f => f.module === 'deals');
    dealCustomFields.forEach(field => {
      const fieldValue = form.getValues(field.name);
      if (fieldValue && fieldValue.trim() !== '') {
        formData.append(field.name, fieldValue);
      }
    });

    const result = deal 
        ? await updateDeal(deal._id, formData) 
        : await createDeal(formData);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
      if (deal) {
        onDealUpdated(result);
      } else {
        onDealCreated(result);
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

  const dialogTitle = deal ? "Edit Deal" : "Create New Deal";
  const dialogDescription = deal ? "Update the details of your deal." : "Fill in the details below to create a new deal in the pipeline.";
  const buttonText = deal ? "Save Changes" : "Create Deal";


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>
          {dialogDescription}
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dealName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Project Phoenix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Innovate Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="$250,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Prospect">Prospect</SelectItem>
                      <SelectItem value="Qualifying">Qualifying</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Negotiation">Negotiation</SelectItem>
                      <SelectItem value="Closed Won">Closed Won</SelectItem>
                      <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
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
                      const updated = [...customFields, { ...newField, module: 'deals' }];
                      setCustomFields(updated);
                      saveCustomFields(updated);
                      setNewField({ name: '', type: 'text' });
                      setShowAddField(false);
                    }}
                  >Save</Button>
                </div>
              )}
              <ul className="space-y-1">
                {customFields.filter(f => f.module === 'deals').length === 0 && (
                  <li className="text-muted-foreground text-xs">No custom fields yet.</li>
                )}
                {customFields.filter(f => f.module === 'deals').map((field) => (
                  <li key={field.name} className="flex items-center gap-2">
                    <span className="font-mono text-xs">{field.name}</span>
                    <span className="text-xs text-muted-foreground">({field.type})</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const updated = customFields.filter(f2 => !(f2.module === 'deals' && f2.name === field.name));
                        setCustomFields(updated);
                        saveCustomFields(updated);
                      }}
                    >Delete</Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Render custom fields dynamically */}
            {customFields.filter(f => f.module === 'deals').map(field => (
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
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
