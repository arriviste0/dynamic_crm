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
import { getCustomFields } from '@/app/actions/custom-fields';
import { Deal, CustomField } from '@/lib/types';

type DealStage = 'Prospect' | 'Qualifying' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

type DealFormCustomFields = {
  [key: string]: string;
};

interface DealFormValues extends DealFormCustomFields {
  dealName: string;
  companyName: string;
  amount: string;
  stage: DealStage;
}

interface CustomFieldValue {
  value: string;
  type: string;
  label: string;
}

interface CustomFieldMap {
  [key: string]: CustomFieldValue;
}

type NewDealDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDealCreated: (deal: any) => void;
  onDealUpdated: (deal: any) => void;
  deal: Deal | null;
};

export function NewDealDialog({
  open,
  onOpenChange,
  onDealCreated,
  onDealUpdated,
  deal
}: NewDealDialogProps) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load custom fields
  useEffect(() => {
    let mounted = true;
    
    async function loadFields() {
      try {
        const response = await getCustomFields();
        if (response.success && Array.isArray(response.data) && mounted) {
          const dealsFields = response.data
            .filter(field => field.module === 'deals')
            .map(field => ({
              name: field.name,
              type: field.type,
              module: field.module,
              _id: field._id.toString(),
              createdAt: new Date(field.createdAt),
              updatedAt: new Date(field.updatedAt)
            }));
          setFields(dealsFields);
        }
      } catch (error) {
        if (mounted) {
          console.error('Failed to load custom fields:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load custom fields'
          });
        }
      }
    }

    if (open) {
      loadFields();
    }
    
    return () => { mounted = false; };
  }, [open, toast]);

  // Create validation schema
  const formSchema = z.object({
    dealName: z.string().min(2, 'Deal name must be at least 2 characters'),
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    amount: z.string().regex(/^\$?\d+(,\d{3})*(\.\d{2})?$/, 'Please enter a valid amount'),
    stage: z.enum(['Prospect', 'Qualifying', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
    ...(fields.reduce<Record<string, z.ZodString>>((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'number'
        ? z.string().regex(/^\d+$/, 'Please enter a valid number')
        : field.type === 'date'
        ? z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date')
        : z.string()
    }), {}))
  });
  
  // Form setup
  const form = useForm<DealFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealName: deal?.dealName || '',
      companyName: deal?.companyName || '',
      amount: deal?.amount || '',
      stage: (deal?.stage as DealStage) || 'Prospect',
      ...Object.fromEntries(
        fields.map(field => [
          field.name,
          typeof deal?.customFields?.[field.name] === 'object' 
            ? String((deal.customFields[field.name] as CustomFieldValue)?.value || '')
            : String(deal?.customFields?.[field.name] || '')
        ])
      )
    }
  });

  // Handle form submission
  const onSubmit = async (values: DealFormValues) => {
    try {
      setIsSubmitting(true);
      form.clearErrors();

      // Prepare form data
      const formData = new FormData();
      formData.append('dealName', values.dealName);
      formData.append('companyName', values.companyName);
      formData.append('amount', values.amount);
      formData.append('stage', values.stage);

      // Process custom fields
      const customData: CustomFieldMap = {};
      
      fields.forEach(field => {
        const value = values[field.name];
        if (value) {
          customData[field.name] = {
            value: value.toString(),
            type: field.type,
            label: field.name
          };
        }
      });

      // Add custom fields to form data if any exist
      if (Object.keys(customData).length > 0) {
        formData.append('customFields', JSON.stringify(customData));
      }

      // Submit to server
      const response = await (deal 
        ? updateDeal(deal._id, formData)
        : createDeal(formData));

      // Handle errors
      if (!response.success) {
        if (response.errors) {
          // Set field-specific errors
          for (const [field, errors] of Object.entries(response.errors)) {
            if (errors?.[0] && form.getValues()[field as keyof DealFormValues] !== undefined) {
              form.setError(field as keyof DealFormValues, {
                type: 'server',
                message: errors[0]
              });
            }
          }
          return;
        }
        throw new Error(response.message);
      }

      // Success case
      toast({
        title: 'Success',
        description: response.message
      });

      // Update parent
      const updatedDeal = {
        ...values,
        _id: deal?._id,
        customFields: customData
      };

      if (deal) {
        onDealUpdated(updatedDeal);
      } else {
        onDealCreated(updatedDeal);
      }

      // Reset and close
      form.reset();
      onOpenChange(false);

    } catch (error) {
      console.error('Error submitting deal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit deal'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{deal ? 'Edit Deal' : 'Create Deal'}</DialogTitle>
          <DialogDescription>
            {deal ? 'Update the deal details below.' : 'Add a new deal with the form below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dealName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter deal name" {...field} />
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
                    <Input placeholder="Enter company name" {...field} />
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
                    <Input placeholder="Enter amount" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {fields.map((field) => (
              <FormField
                key={field._id}
                control={form.control}
                name={field.name as keyof DealFormValues}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.name}</FormLabel>
                    <FormControl>
                      <Input
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        placeholder={`Enter ${field.name.toLowerCase()}`}
                        {...formField}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : deal ? 'Save Changes' : 'Create Deal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function NewDealDialog({
  open,
  onOpenChange,
  onDealCreated,
  onDealUpdated,
  deal
}: NewDealDialogProps) {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load custom fields
  useEffect(() => {
    let mounted = true;
    
    async function loadFields() {
      try {
        const response = await getCustomFields();
        if (response.success && Array.isArray(response.data) && mounted) {
          const dealsFields = response.data
            .filter(field => field.module === 'deals')
            .map(field => ({
              name: field.name,
              type: field.type,
              module: field.module,
              _id: field._id.toString(),
              createdAt: new Date(field.createdAt),
              updatedAt: new Date(field.updatedAt)
            }));
          setFields(dealsFields);
        }
      } catch (error) {
        if (mounted) {
          console.error('Failed to load custom fields:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load custom fields'
          });
        }
      }
    }

    if (open) {
      loadFields();
    }
    
    return () => { mounted = false; };
  }, [open, toast]);

  // Create validation schema
  const formSchema = z.object({
    dealName: z.string().min(2, 'Deal name must be at least 2 characters'),
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    amount: z.string().regex(/^\$?\d+(,\d{3})*(\.\d{2})?$/, 'Please enter a valid amount'),
    stage: z.enum(['Prospect', 'Qualifying', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']),
    ...(fields.reduce<Record<string, z.ZodString>>((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'number'
        ? z.string().regex(/^\d+$/, 'Please enter a valid number')
        : field.type === 'date'
        ? z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date')
        : z.string()
    }), {}))
  });
  
  // Form setup
  const form = useForm<DealFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealName: deal?.dealName || '',
      companyName: deal?.companyName || '',
      amount: deal?.amount || '',
      stage: (deal?.stage as DealStage) || 'Prospect',
      ...Object.fromEntries(
        fields.map(field => [
          field.name,
          typeof deal?.customFields?.[field.name] === 'object' 
            ? String(deal.customFields[field.name]?.value || '')
            : String(deal?.customFields?.[field.name] || '')
        ])
      )
    }
  });

  // Handle form submission
  const onSubmit = async (values: DealFormValues) => {
    try {
      setIsSubmitting(true);
      form.clearErrors();

      // Prepare form data
      const formData = new FormData();
      formData.append('dealName', values.dealName);
      formData.append('companyName', values.companyName);
      formData.append('amount', values.amount);
      formData.append('stage', values.stage);

      // Process custom fields
      const customData: CustomFieldMap = {};
      
      fields.forEach(field => {
        const value = values[field.name];
        if (value) {
          customData[field.name] = {
            value: value.toString(),
            type: field.type,
            label: field.name
          };
        }
      });

      // Add custom fields to form data if any exist
      if (Object.keys(customData).length > 0) {
        formData.append('customFields', JSON.stringify(customData));
      }

      // Submit to server
      const response = await (deal 
        ? updateDeal(deal._id, formData)
        : createDeal(formData));

      // Handle errors
      if (!response.success) {
        if (response.errors) {
          // Set field-specific errors
          for (const [field, errors] of Object.entries(response.errors)) {
            if (errors?.[0] && field in form.getValues()) {
              form.setError(field as keyof DealFormValues, {
                type: 'server',
                message: errors[0]
              });
            }
          }
          return;
        }
        throw new Error(response.message);
      }

      // Success case
      toast({
        title: 'Success',
        description: response.message
      });

      // Update parent
      const updatedDeal = {
        ...values,
        _id: deal?._id,
        customFields: customData
      };

      if (deal) {
        onDealUpdated(updatedDeal);
      } else {
        onDealCreated(updatedDeal);
      }

      // Reset and close
      form.reset();
      onOpenChange(false);

    } catch (error) {
      console.error('Error submitting deal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit deal'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
                    onClick={async () => {
                      if (!newField.name.trim()) return;
                      const result = await createCustomField(newField);
                      if (result.success) {
                        const fetchCustomFields = async () => {
                          const result = await getCustomFields('deals');
                          if (result.success && result.data) {
                            const fields = result.data.map(doc => ({
                              _id: doc._id.toString(),
                              name: doc.name as string,
                              type: doc.type as string,
                              module: doc.module as string,
                              createdAt: new Date(doc.createdAt as string),
                              updatedAt: new Date(doc.updatedAt as string)
                            }));
                            setCustomFields(fields);
                          }
                        };
                        fetchCustomFields();
                        setNewField({ name: '', type: 'text', module: 'deals' });
                        setShowAddField(false);
                      }
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
                      onClick={async () => {
                        const result = await deleteCustomField(field._id);
                        if (result.success) {
                          setCustomFields(customFields.filter(f2 => f2._id !== field._id));
                        }
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
                name={field.name as keyof DealFormValues}
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
                {isSubmitting ? 'Saving...' : deal ? 'Save Changes' : 'Create Deal'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
