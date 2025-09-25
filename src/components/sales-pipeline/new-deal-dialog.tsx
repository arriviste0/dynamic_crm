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
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react';
import { CustomField } from '@/lib/types';
import { GripVertical } from 'lucide-react';
import { getCustomFields } from '@/app/actions/custom-fields';
import { updateFieldOrder } from '@/lib/field-order';

const dealSchema = z.object({
  dealName: z.string().min(2, 'Deal name must be at least 2 characters.'),
  amount: z.string().min(1, 'Amount is required'),
  stage: z.string().min(1, 'Stage is required'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters.'),
});

// Utility function to reorder items in an array
const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

interface NewDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDealCreated?: () => void;
}

export function NewDealDialog({
  open,
  onOpenChange,
  onDealCreated
}: NewDealDialogProps) {
  const { toast } = useToast();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [fieldOrder, setFieldOrder] = useState<string[]>([]);

  const form = useForm({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      dealName: '',
      amount: '',
      stage: '',
      companyName: '',
    }
  });

  useEffect(() => {
    if (open) {
      // Load custom fields when dialog opens
      const loadCustomFields = async () => {
        try {
          const fields = await getCustomFields('deals');
          setCustomFields(fields);
          setFieldOrder(fields.map(f => f.name));
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load custom fields'
          });
        }
      };
      loadCustomFields();
    }
  }, [open, toast]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newOrder = reorder(
      fieldOrder,
      result.source.index,
      result.destination.index
    );

    setFieldOrder(newOrder);
  }

  const onSubmit = async (data: any) => {
    try {
      // Add custom fields data
      const customFieldsData = customFields.reduce((acc, field) => {
        acc[field.name] = data[field.name] || '';
        return acc;
      }, {} as Record<string, string>);

      const dealData = {
        ...data,
        ...customFieldsData,
        fieldOrder
      };

      // Here you'll implement the create deal action
      // const result = await createDeal(dealData);

      toast({
        title: 'Success',
        description: 'Deal created successfully'
      });

      onOpenChange(false);
      if (onDealCreated) {
        onDealCreated();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create deal'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
          <DialogDescription>
            Add a new deal to your sales pipeline.
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter deal amount" type="number" {...field} />
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
                    </SelectContent>
                  </Select>
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Custom Fields</h3>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="custom-fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {customFields.map((field, index) => (
                        <Draggable key={field.name} draggableId={field.name} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center space-x-2 mb-4"
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <FormField
                                control={form.control}
                                name={field.name}
                                render={({ field: formField }) => (
                                  <FormItem className="flex-1">
                                    <FormLabel>{field.label}</FormLabel>
                                    <FormControl>
                                      <Input {...formField} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <DialogFooter>
              <Button type="submit">Create Deal</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
