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
import { createService, updateService } from '@/app/actions/services';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect } from 'react';
import { Service } from '@/lib/types';

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  price: z.number().min(0, 'Price must be positive.'),
  duration: z.number().min(1, 'Duration must be at least 1 hour.'),
  status: z.enum(['Active', 'Inactive']),
  tags: z.string().optional(),
});

type NewServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceCreated: (service: any) => void;
  onServiceUpdated: (service: any) => void;
  service: Service | null;
};

export function NewServiceDialog({ open, onOpenChange, onServiceCreated, onServiceUpdated, service }: NewServiceDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: 0,
      duration: 1,
      status: 'Active',
      tags: '',
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        duration: service.duration,
        status: service.status,
        tags: service.tags.join(', '),
      });
    } else {
      form.reset({
        name: '',
        description: '',
        category: '',
        price: 0,
        duration: 1,
        status: 'Active',
        tags: '',
      });
    }
  }, [service, form, open]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: z.infer<typeof serviceSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Parse tags
    const tags = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const result = service 
        ? await updateService(service._id, formData) 
        : await createService(formData);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
      if (service) {
        onServiceUpdated(result);
      } else {
        onServiceCreated(result);
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

  const dialogTitle = service ? "Edit Service" : "Create New Service";
  const dialogDescription = service ? "Update the details of your service." : "Fill in the details below to create a new service.";
  const buttonText = service ? "Save Changes" : "Create Service";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>
          {dialogDescription}
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Web Development" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe the service in detail..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input placeholder="Technology" {...field} />
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price *</FormLabel>
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
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (hours) *</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="web, development, consulting (comma-separated)"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

