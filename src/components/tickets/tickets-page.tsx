'use client';

import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Undo2, Redo2, Clock, User, Tag } from 'lucide-react';
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
import { NewTicketDialog } from './new-ticket-dialog';
import { getTickets, deleteTicket } from '@/app/actions/tickets';
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
import { Ticket } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Open': 'default',
  'In Progress': 'secondary',
  'Resolved': 'default',
  'Closed': 'outline',
};

const priorityVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Urgent': 'destructive',
  'High': 'destructive',
  'Medium': 'secondary',
  'Low': 'outline',
};

export function TicketsPage() {
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Ticket[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedTickets = await getTickets();
      setTickets(fetchedTickets);
      setHistory([fetchedTickets]);
      setHistoryIndex(0);
    });
  }, []);

  const handleTicketCreated = (newTicket: Ticket) => {
    startTransition(async () => {
      const fetchedTickets = await getTickets();
      setTickets(fetchedTickets);
      addToHistory(fetchedTickets);
    });
  };

  const handleTicketUpdated = (updatedTicket: Ticket) => {
    setEditingTicket(null);
    startTransition(async () => {
      const fetchedTickets = await getTickets();
      setTickets(fetchedTickets);
      addToHistory(fetchedTickets);
    });
  };

  const addToHistory = (newTickets: Ticket[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newTickets);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTickets(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTickets(history[newIndex]);
    }
  };

  const handleDelete = async () => {
    if (!deletingTicket) return;

    startTransition(async () => {
      const result = await deleteTicket(deletingTicket._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        const newTickets = tickets.filter(t => t._id !== deletingTicket._id);
        setTickets(newTickets);
        addToHistory(newTickets);
        setDeletingTicket(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Tickets</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tickets..."
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
        <Button onClick={() => { setEditingTicket(null); setIsNewTicketDialogOpen(true); }}>
          + New Ticket
        </Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>
              Manage support tickets and customer issues. ({filteredTickets.length} tickets)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Priority</TableHead>
                  <TableHead className="hidden xl:table-cell">Category</TableHead>
                  <TableHead className="text-right">Assigned To</TableHead>
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
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No tickets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map(ticket => (
                    <TableRow key={ticket._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.ticketNumber}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {ticket.description}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {ticket.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {ticket.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{ticket.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="font-medium">{ticket.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{ticket.customer.email}</div>
                          <div className="text-sm text-muted-foreground">{ticket.customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={statusVariant[ticket.status] || 'outline'}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={priorityVariant[ticket.priority] || 'outline'}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge variant="outline">{ticket.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="hidden lg:inline">{ticket.assignedTo.name}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={ticket.assignedTo.avatar} alt={ticket.assignedTo.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{ticket.assignedTo.name.charAt(0)}</AvatarFallback>
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
                            <DropdownMenuItem onSelect={() => { setEditingTicket(ticket); setIsNewTicketDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeletingTicket(ticket)} className="text-destructive">
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
      <NewTicketDialog 
        open={isNewTicketDialogOpen} 
        onOpenChange={setIsNewTicketDialogOpen} 
        onTicketCreated={handleTicketCreated}
        onTicketUpdated={handleTicketUpdated}
        ticket={editingTicket}
      />
      <AlertDialog open={!!deletingTicket} onOpenChange={(open) => !open && setDeletingTicket(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the ticket "{deletingTicket?.title}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Ticket'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}