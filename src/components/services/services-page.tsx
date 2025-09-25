'use client';

import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Undo2, Redo2, DollarSign, Clock, Tag } from 'lucide-react';
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
import { NewServiceDialog } from './new-service-dialog';
import { getServices, deleteService } from '@/app/actions/services';
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
import { Service } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Active': 'default',
  'Inactive': 'outline',
};

export function ServicesPage() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [isNewServiceDialogOpen, setIsNewServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Service[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedServices = await getServices();
      setServices(fetchedServices);
      setHistory([fetchedServices]);
      setHistoryIndex(0);
    });
  }, []);

  const handleServiceCreated = (newService: Service) => {
    startTransition(async () => {
      const fetchedServices = await getServices();
      setServices(fetchedServices);
      addToHistory(fetchedServices);
    });
  };

  const handleServiceUpdated = (updatedService: Service) => {
    setEditingService(null);
    startTransition(async () => {
      const fetchedServices = await getServices();
      setServices(fetchedServices);
      addToHistory(fetchedServices);
    });
  };

  const addToHistory = (newServices: Service[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newServices);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setServices(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setServices(history[newIndex]);
    }
  };

  const handleDelete = async () => {
    if (!deletingService) return;

    startTransition(async () => {
      const result = await deleteService(deletingService._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        const newServices = services.filter(s => s._id !== deletingService._id);
        setServices(newServices);
        addToHistory(newServices);
        setDeletingService(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="hidden text-lg font-semibold md:block">Services</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search services..."
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
        <Button onClick={() => { setEditingService(null); setIsNewServiceDialogOpen(true); }}>
          + New Service
        </Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Manage your service offerings and pricing. ({filteredServices.length} services)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden lg:table-cell">Duration</TableHead>
                  <TableHead className="hidden xl:table-cell">Status</TableHead>
                  <TableHead className="text-right">Tags</TableHead>
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
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No services found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map(service => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{service.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-medium">{formatCurrency(service.price)}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {service.duration}h
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge variant={statusVariant[service.status] || 'outline'}>
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {service.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {service.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{service.tags.length - 3}
                            </Badge>
                          )}
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
                            <DropdownMenuItem onSelect={() => { setEditingService(service); setIsNewServiceDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeletingService(service)} className="text-destructive">
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
      <NewServiceDialog 
        open={isNewServiceDialogOpen} 
        onOpenChange={setIsNewServiceDialogOpen} 
        onServiceCreated={handleServiceCreated}
        onServiceUpdated={handleServiceUpdated}
        service={editingService}
      />
      <AlertDialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the service "{deletingService?.name}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Service'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}