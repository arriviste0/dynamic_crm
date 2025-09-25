
'use client';

import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Undo2, Redo2, Calendar, DollarSign, Users } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import React, { useState, useTransition } from 'react';
import { NewProjectDialog } from './new-project-dialog';
import { getProjects, deleteProject } from '@/app/actions/projects';
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
import { Project } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'In Progress': 'default',
  'Completed': 'default',
  'Planning': 'secondary',
  'On Hold': 'outline',
  'Cancelled': 'destructive',
};

const priorityVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Urgent': 'destructive',
  'High': 'destructive',
  'Medium': 'secondary',
  'Low': 'outline',
};

export function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Project[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
      setHistory([fetchedProjects]);
      setHistoryIndex(0);
    });
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    startTransition(async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
      addToHistory(fetchedProjects);
    });
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setEditingProject(null);
    startTransition(async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
      addToHistory(fetchedProjects);
    });
  };

  const addToHistory = (newProjects: Project[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newProjects);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setProjects(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setProjects(history[newIndex]);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;

    startTransition(async () => {
      const result = await deleteProject(deletingProject._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        const newProjects = projects.filter(p => p._id !== deletingProject._id);
        setProjects(newProjects);
        addToHistory(newProjects);
        setDeletingProject(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Projects</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
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
        <Button onClick={() => { setEditingProject(null); setIsNewProjectDialogOpen(true); }}>
          + New Project
        </Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Manage your projects, tasks, and milestones. ({filteredProjects.length} projects)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead className="hidden lg:table-cell">Progress</TableHead>
                  <TableHead className="hidden xl:table-cell">Budget</TableHead>
                  <TableHead className="text-right">Owner</TableHead>
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
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No projects found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map(project => (
                    <TableRow key={project._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {project.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={statusVariant[project.status] || 'outline'}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={priorityVariant[project.priority] || 'outline'}>
                          {project.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{project.progress}%</span>
                            <span className="text-muted-foreground">
                              {formatDate(project.startDate)} - {formatDate(project.endDate)}
                            </span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{formatCurrency(project.budget)}</div>
                          <div className="text-xs text-muted-foreground">
                            Spent: {formatCurrency(project.actualCost)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="hidden lg:inline">{project.owner.name}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={project.owner.avatar} alt={project.owner.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
                          </Avatar>
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
                            <DropdownMenuItem onSelect={() => { setEditingProject(project); setIsNewProjectDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeletingProject(project)} className="text-destructive">
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
      <NewProjectDialog 
        open={isNewProjectDialogOpen} 
        onOpenChange={setIsNewProjectDialogOpen} 
        onProjectCreated={handleProjectCreated}
        onProjectUpdated={handleProjectUpdated}
        project={editingProject}
      />
      <AlertDialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the project "{deletingProject?.name}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
