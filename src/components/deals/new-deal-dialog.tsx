
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
import React, { useEffect } from 'react';

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
  const { toast } = useToast();
  const form = useForm<z.infer<typeof dealSchema>>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      dealName: '',
      companyName: '',
      amount: '',
      stage: 'Prospect',
    },
  });

  useEffect(() => {
    if (deal) {
      form.reset(deal);
    } else {
      form.reset({
        dealName: '',
        companyName: '',
        amount: '',
        stage: 'Prospect',
      });
    }
  }, [deal, form, open]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: z.infer<typeof dealSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
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
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
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
