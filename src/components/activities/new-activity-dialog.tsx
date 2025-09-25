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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createActivity, updateActivity } from '@/app/actions/activities';
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

const activitySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  type: z.enum(['Call', 'Email', 'Meeting', 'Task', 'Note']),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  dueDate: z.string().min(1, 'Due date is required.'),
  status: z.enum(['Pending', 'Completed', 'Cancelled']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  relatedToType: z.enum(['Deal', 'Contact', 'Account', 'Project']),
  relatedToId: z.string().min(1, 'Related entity ID is required.'),
  relatedToName: z.string().min(2, 'Related entity name is required.'),
});

type NewActivityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityCreated: (activity: any) => void;
  onActivityUpdated: (activity: any) => void;
  activity: any | null;
};

export function NewActivityDialog({ open, onOpenChange, onActivityCreated, onActivityUpdated, activity }: NewActivityDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      type: 'Call',
      description: '',
      dueDate: '',
      status: 'Pending',
      priority: 'Medium',
      relatedToType: 'Deal',
      relatedToId: '',
      relatedToName: '',
    },
  });

  useEffect(() => {
    if (activity) {
      form.reset({
        title: activity.title,
        type: activity.type,
        description: activity.description,
        dueDate: typeof activity.dueDate === 'string' ? activity.dueDate : activity.dueDate?.toISOString().slice(0, 10) || '',
        status: activity.status,
        priority: activity.priority,
        relatedToType: activity.relatedTo?.type || 'Deal',
        relatedToId: activity.relatedTo?.id || '',
        relatedToName: activity.relatedTo?.name || '',
      });
    } else {
      form.reset({
        title: '',
        type: 'Call',
        description: '',
        dueDate: '',
        status: 'Pending',
        priority: 'Medium',
        relatedToType: 'Deal',
        relatedToId: '',
        relatedToName: '',
      });
    }
  }, [activity, form, open]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Custom fields state
  const [customFields, setCustomFields] = React.useState<any[]>([]);
  const [showAddField, setShowAddField] = React.useState(false);
  const [newField, setNewField] = React.useState({ name: '', type: 'text' });

  useEffect(() => {
    setCustomFields(getCustomFields());
  }, [open]);

  // Custom field order state (for activities only)
  const [fieldOrder, setFieldOrder] = React.useState<number[]>([]);
  useEffect(() => {
    const activityFields = customFields.filter(f => f.module === 'activities');
    setFieldOrder(activityFields.map((_, i) => i));
  }, [customFields]);

  const moveField = (from: number, to: number) => {
    setFieldOrder(order => {
      const newOrder = [...order];
      const [removed] = newOrder.splice(from, 1);
      newOrder.splice(to, 0, removed);
      return newOrder;
    });
  };

  const onSubmit = async (values: z.infer<typeof activitySchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    // Add custom fields
    customFields.filter(f => f.module === 'activities').forEach(field => {
      formData.append(field.name, (values as any)[field.name] || '');
    });
    // Add relatedTo as nested object
    formData.append('relatedTo.type', values.relatedToType);
    formData.append('relatedTo.id', values.relatedToId);
    formData.append('relatedTo.name', values.relatedToName);

    const result = activity
      ? await updateActivity(activity._id, formData)
      : await createActivity(formData);

    if (result.success) {
      toast({ title: 'Success!', description: result.message });
      form.reset();
      onOpenChange(false);
      if (activity) {
        onActivityUpdated(result);
      } else {
        onActivityCreated(result);
      }
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSubmitting(false);
  };

  const dialogTitle = activity ? 'Edit Activity' : 'Create New Activity';
  const dialogDescription = activity ? 'Update the details of your activity.' : 'Fill in the details below to create a new activity.';
  const buttonText = activity ? 'Save Changes' : 'Create Activity';

  // Get ordered custom fields for activities
  const activityFields = customFields.filter(f => f.module === 'activities');
  const orderedFields = fieldOrder.map(i => activityFields[i]).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>{dialogDescription}</DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Follow up call with client" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
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
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Task">Task</SelectItem>
                      <SelectItem value="Note">Note</SelectItem>
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the activity..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relatedToType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related To Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Deal">Deal</SelectItem>
                        <SelectItem value="Contact">Contact</SelectItem>
                        <SelectItem value="Account">Account</SelectItem>
                        <SelectItem value="Project">Project</SelectItem>
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
                name="relatedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related To ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="ID of related entity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relatedToName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related To Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of related entity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      const updated = [...customFields, { ...newField, module: 'activities' }];
                      setCustomFields(updated);
                      saveCustomFields(updated);
                      setNewField({ name: '', type: 'text' });
                      setShowAddField(false);
                    }}
                  >Save</Button>
                </div>
              )}
              <ul className="space-y-1">
                {orderedFields.length === 0 && (
                  <li className="text-muted-foreground text-xs">No custom fields yet.</li>
                )}
                {orderedFields.map((field, idx) => (
                  <li key={field.name} className="flex items-center gap-2">
                    <span className="font-mono text-xs">{field.name}</span>
                    <span className="text-xs text-muted-foreground">({field.type})</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const updated = customFields.filter(f2 => !(f2.module === 'activities' && f2.name === field.name));
                        setCustomFields(updated);
                        saveCustomFields(updated);
                      }}
                    >Delete</Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={idx === 0}
                      onClick={() => moveField(idx, idx - 1)}
                    >↑</Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={idx === orderedFields.length - 1}
                      onClick={() => moveField(idx, idx + 1)}
                    >↓</Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Render custom fields dynamically */}
            {orderedFields.map(field => (
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
