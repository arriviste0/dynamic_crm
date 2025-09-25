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
import { createProject, updateProject } from '@/app/actions/projects';
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
import { Project } from '@/lib/types';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  status: z.enum(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  startDate: z.string().min(1, 'Start date is required.'),
  endDate: z.string().min(1, 'End date is required.'),
  progress: z.number().min(0).max(100, 'Progress must be between 0 and 100.'),
  budget: z.number().min(0, 'Budget must be positive.'),
  actualCost: z.number().min(0, 'Actual cost must be positive.'),
  tags: z.string().optional(),
});

type NewProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: any) => void;
  onProjectUpdated: (project: any) => void;
  project: Project | null;
};

export function NewProjectDialog({ open, onOpenChange, onProjectCreated, onProjectUpdated, project }: NewProjectDialogProps) {
  const { toast } = useToast();
  
  // Custom fields state (must be inside component)
  const [customFields, setCustomFields] = React.useState<any[]>([]);
  const [showAddField, setShowAddField] = React.useState(false);
  const [newField, setNewField] = React.useState({ name: '', type: 'text' });

  useEffect(() => {
    setCustomFields(getCustomFields());
  }, [open]);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Planning',
      priority: 'Medium',
      startDate: '',
      endDate: '',
      progress: 0,
      budget: 0,
      actualCost: 0,
      tags: '',
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: typeof project.startDate === 'string' ? project.startDate : project.startDate?.toISOString().slice(0, 10) || '',
        endDate: typeof project.endDate === 'string' ? project.endDate : project.endDate?.toISOString().slice(0, 10) || '',
        progress: project.progress,
        budget: project.budget,
        actualCost: project.actualCost,
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        status: 'Planning',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        progress: 0,
        budget: 0,
        actualCost: 0,
        tags: '',
      });
    }
  }, [project, form, open]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Add all fields to form data
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    const result = project 
        ? await updateProject(project._id, formData) 
        : await createProject(formData);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      form.reset();
      onOpenChange(false);
      if (project) {
        onProjectUpdated(result);
      } else {
        onProjectCreated(result);
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

  const dialogTitle = project ? "Edit Project" : "Create New Project";
  const dialogDescription = project ? "Update the details of your project." : "Fill in the details below to create a new project.";
  const buttonText = project ? "Save Changes" : "Create Project";

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
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign" {...field} />
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
                      placeholder="A comprehensive redesign of our company website to improve user experience and modernize the interface..."
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
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="0"
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
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($) *</FormLabel>
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
                name="actualCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Cost ($) *</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="web, design, frontend, react (comma-separated)"
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
                      const updated = [...customFields, { ...newField, module: 'projects' }];
                      setCustomFields(updated);
                      saveCustomFields(updated);
                      setNewField({ name: '', type: 'text' });
                      setShowAddField(false);
                    }}
                  >Save</Button>
                </div>
              )}
              <ul className="space-y-1">
                {customFields.filter(f => f.module === 'projects').length === 0 && (
                  <li className="text-muted-foreground text-xs">No custom fields yet.</li>
                )}
                {customFields.filter(f => f.module === 'projects').map((field) => (
                  <li key={field.name} className="flex items-center gap-2">
                    <span className="font-mono text-xs">{field.name}</span>
                    <span className="text-xs text-muted-foreground">({field.type})</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const updated = customFields.filter(f2 => !(f2.module === 'projects' && f2.name === field.name));
                        setCustomFields(updated);
                        saveCustomFields(updated);
                      }}
                    >Delete</Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Render custom fields dynamically */}
            {customFields.filter(f => f.module === 'projects').map(field => (
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
