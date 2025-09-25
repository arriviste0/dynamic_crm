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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createContact, updateContact } from '@/app/actions/contacts';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState } from 'react';
import { Contact, CustomField, CustomFieldsMap } from '@/lib/types';
import { GripVertical } from 'lucide-react';
import { getCustomFields, createCustomField, deleteCustomField } from '@/app/actions/custom-fields';
import { updateFieldOrder, updateCustomFields } from '@/lib/field-order';

// Utility function to reorder items in an array
const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters.'),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters.'),
  company: z.string().min(2, 'Company must be at least 2 characters.'),
  department: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }),
  status: z.enum(['Active', 'Inactive', 'Lead', 'Customer']),
  notes: z.string().optional(),
});

type NewContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactCreated: (contact: any) => void;
  onContactUpdated: (contact: any) => void;
  contact: Contact | null;
};

export function NewContactDialog({ open, onOpenChange, onContactCreated, onContactUpdated, contact }: NewContactDialogProps) {
  const { toast } = useToast();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [fieldOrder, setFieldOrder] = useState<string[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomField>>({ name: '', type: 'text', module: 'contacts' });
  
  // Handle field reordering
  const handleDragEnd = async (result: DropResult) => {
    // Drop outside the list
    if (!result.destination) return;

    // Same position
    if (result.destination.index === result.source.index) return;

    // Reorder the fields
    const newOrder = reorder(
      fieldOrder,
      result.source.index,
      result.destination.index
    );

    setFieldOrder(newOrder);

    // Persist the order if we have a contact ID
    if (contact?._id) {
      const success = await updateFieldOrder('contacts', contact._id, newOrder);
      if (!success) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save field order'
        });
      }
    }
  }
  
  // Extend form schema to include custom fields dynamically
  const customFieldDefaults = customFields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {} as Record<string, string>);
  const form = useForm<any>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      company: '',
      department: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      status: 'Lead',
      notes: '',
      ...customFieldDefaults,
    },
  });

  useEffect(() => {
    if (open) {
      async function loadFields() {
        try {
          const result = await getCustomFields('contacts');
          if (result.success && Array.isArray(result.data)) {
            const fields = result.data
              .filter(f => f.module === 'contacts')
              .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            setCustomFields(fields);
            
            // Set initial field order
            if (contact?._id) {
              const savedOrder = contact.fieldOrder || fields.map(f => f.name);
              setFieldOrder(savedOrder);
            } else {
              setFieldOrder(fields.map(f => f.name));
            }
          }
        } catch (error) {
          console.error('Error loading custom fields:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load custom fields'
          });
        }
      }
      loadFields();
    }
  }, [open, contact, toast]);

  useEffect(() => {
    if (contact) {
      form.reset({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        jobTitle: contact.jobTitle,
        company: contact.company,
        department: contact.department || '',
        address: contact.address,
        status: contact.status,
        notes: contact.notes || '',
        ...customFieldDefaults,
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        company: '',
        department: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        status: 'Lead',
        notes: '',
        ...customFieldDefaults,
      });
    }
    // eslint-disable-next-line
  }, [contact, form, open, customFields]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Flatten the address object for form data
    Object.entries(values.address).forEach(([key, value]) => {
      formData.append(`address.${key}`, value || '');
    });
    
    // Add other fields
    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'address') {
        formData.append(key, value as string);
      }
    });

    const result = contact 
        ? await updateContact(contact._id, formData) 
        : await createContact(formData);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
      if (contact) {
        onContactUpdated(result);
      } else {
        onContactCreated(result);
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

  const dialogTitle = contact ? "Edit Contact" : "Create New Contact";
  const dialogDescription = contact ? "Update the details of your contact." : "Fill in the details below to create a new contact.";
  const buttonText = contact ? "Save Changes" : "Create Contact";

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
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
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
                      <Input placeholder="john.doe@company.com" {...field} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Address (Optional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address</FormLabel>
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
                      <FormLabel>City</FormLabel>
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
                      <FormLabel>State</FormLabel>
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
                      <FormLabel>ZIP Code</FormLabel>
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
                      <FormLabel>Country</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Lead">Lead</SelectItem>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this contact..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Fields Section */}
            <div className="space-y-4 border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Custom Fields</h3>
                  <p className="text-sm text-muted-foreground">Add, remove and reorder custom fields</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddField(v => !v)}
                >
                  {showAddField ? 'Cancel' : 'Add Field'}
                </Button>
              </div>

              {showAddField && (
                <div className="p-4 bg-muted/20 rounded-lg space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <FormItem>
                        <FormLabel>Field Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter field name"
                            value={newField.name}
                            onChange={e => setNewField(f => ({ ...f, name: e.target.value }))}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                    <div className="flex-1">
                      <FormItem>
                        <FormLabel>Field Type</FormLabel>
                        <Select
                          value={newField.type}
                          onValueChange={value => setNewField(f => ({ ...f, type: value }))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!newField.name.trim()) return;
                        const result = await createCustomField({
                          ...newField,
                          order: customFields.length,
                          label: newField.name,
                          module: 'contacts'
                        });
                        if (result.success) {
                          const fieldsResult = await getCustomFields('contacts');
                          if (fieldsResult.success && fieldsResult.data) {
                            const fields = fieldsResult.data
                              .filter(f => f.module === 'contacts')
                              .sort((a, b) => (a.order || 0) - (b.order || 0))
                              .map(doc => ({
                                _id: doc._id.toString(),
                                name: doc.name as string,
                                type: doc.type as string,
                                module: doc.module as string,
                                order: doc.order as number || 0,
                                label: doc.label as string || doc.name as string,
                                createdAt: new Date(doc.createdAt as string),
                                updatedAt: new Date(doc.updatedAt as string)
                              }));
                            setCustomFields(fields);
                            setFieldOrder(fields.map(f => f.name));
                          }
                          setNewField({ name: '', type: 'text', module: 'contacts' });
                          setShowAddField(false);
                        }
                      }}
                    >
                      Save Field
                    </Button>
                  </div>
                </div>
              )}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="custom-fields">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 mt-4"
                    >
                      {fieldOrder.map((fieldName, index) => {
                        const field = customFields.find(f => f.name === fieldName);
                        if (!field) return null;

                        return (
                          <Draggable
                            key={field.name}
                            draggableId={field.name}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-2 p-2 border rounded-md bg-background"
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="px-2 cursor-move"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <FormField
                                  control={form.control}
                                  name={field.name}
                                  render={({ field: formField }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel>{field.label || field.name}</FormLabel>
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
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="self-start mt-6"
                                  onClick={async () => {
                                    const result = await deleteCustomField(field._id);
                                    if (result.success) {
                                      setCustomFields(prev => prev.filter(f => f._id !== field._id));
                                      setFieldOrder(prev => prev.filter(name => name !== field.name));
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {fieldOrder.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No custom fields yet. Add some above.
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
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
