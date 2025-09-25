'use client';

import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Undo2, Redo2, Calendar, Clock, User } from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from '../layout/user-nav';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import React, { useState, useTransition } from 'react';
import { NewActivityDialog } from './new-activity-dialog';
import { getActivities, deleteActivity } from '@/app/actions/activities';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Activity } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Pending': 'secondary',
  'Completed': 'default',
  'Cancelled': 'destructive',
};

const priorityVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Urgent': 'destructive',
  'High': 'destructive',
  'Medium': 'secondary',
  'Low': 'outline',
};

const typeVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Call': 'default',
  'Email': 'secondary',
  'Meeting': 'default',
  'Task': 'outline',
  'Note': 'secondary',
};

export function ActivitiesPage() {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [isNewActivityDialogOpen, setIsNewActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Activity[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedActivities = await getActivities();
      setActivities(fetchedActivities);
      setHistory([fetchedActivities]);
      setHistoryIndex(0);
    });
  }, []);

  const handleActivityCreated = (newActivity: Activity) => {
    startTransition(async () => {
      const fetchedActivities = await getActivities();
      setActivities(fetchedActivities);
      addToHistory(fetchedActivities);
    });
  };

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setEditingActivity(null);
    startTransition(async () => {
      const fetchedActivities = await getActivities();
      setActivities(fetchedActivities);
      addToHistory(fetchedActivities);
    });
  };

  const addToHistory = (newActivities: Activity[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newActivities);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setActivities(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setActivities(history[newIndex]);
    }
  };

  const handleDelete = async () => {
    if (!deletingActivity) return;

    startTransition(async () => {
      const result = await deleteActivity(deletingActivity._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        const newActivities = activities.filter(a => a._id !== deletingActivity._id);
        setActivities(newActivities);
        addToHistory(newActivities);
        setDeletingActivity(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.relatedTo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Activities</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search activities..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] border-2 shadow-brutal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="hidden md:block">
          <UserNav />
        </div>
        <Button onClick={() => { setEditingActivity(null); setIsNewActivityDialogOpen(true); }}>
          + New Activity
        </Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
            <CardDescription>
              Track and manage all your business activities. ({filteredActivities.length} activities)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Priority</TableHead>
                  <TableHead className="hidden xl:table-cell">Due Date</TableHead>
                  <TableHead className="text-right">Related To</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No activities found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map(activity => (
                    <TableRow key={activity._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {activity.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={typeVariant[activity.type] || 'outline'}>
                          {activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={statusVariant[activity.status] || 'outline'}>
                          {activity.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={priorityVariant[activity.priority] || 'outline'}>
                          {activity.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(activity.dueDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{activity.relatedTo.name}</div>
                          <div className="text-xs text-muted-foreground">{activity.relatedTo.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => { setEditingActivity(activity); setIsNewActivityDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeletingActivity(activity)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <NewActivityDialog 
        open={isNewActivityDialogOpen} 
        onOpenChange={setIsNewActivityDialogOpen} 
        onActivityCreated={handleActivityCreated}
        onActivityUpdated={handleActivityUpdated}
        activity={editingActivity}
      />
      <AlertDialog open={!!deletingActivity} onOpenChange={(open) => !open && setDeletingActivity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the activity "{deletingActivity?.title}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Activity'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}