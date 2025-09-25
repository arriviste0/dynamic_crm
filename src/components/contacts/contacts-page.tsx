
'use client';

import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Undo2, Redo2 } from 'lucide-react';
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
import { NewContactDialog } from './new-contact-dialog';
import { getContacts, deleteContact } from '@/app/actions/contacts';
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
import { Contact } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Active': 'default',
  'Customer': 'default',
  'Lead': 'secondary',
  'Inactive': 'outline',
};

export function ContactsPage() {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isNewContactDialogOpen, setIsNewContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Contact[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedContacts = await getContacts();
      setContacts(fetchedContacts);
      setHistory([fetchedContacts]);
      setHistoryIndex(0);
    });
  }, []);

  const handleContactCreated = (newContact: Contact) => {
    startTransition(async () => {
      const fetchedContacts = await getContacts();
      setContacts(fetchedContacts);
      addToHistory(fetchedContacts);
    });
  };

  const handleContactUpdated = (updatedContact: Contact) => {
    setEditingContact(null);
    startTransition(async () => {
      const fetchedContacts = await getContacts();
      setContacts(fetchedContacts);
      addToHistory(fetchedContacts);
    });
  };

  const addToHistory = (newContacts: Contact[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContacts);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContacts(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContacts(history[newIndex]);
    }
  };

  const handleDelete = async () => {
    if (!deletingContact) return;

    startTransition(async () => {
      const result = await deleteContact(deletingContact._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        const newContacts = contacts.filter(c => c._id !== deletingContact._id);
        setContacts(newContacts);
        addToHistory(newContacts);
        setDeletingContact(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const filteredContacts = contacts.filter(contact =>
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Contacts</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
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
        <Button onClick={() => { setEditingContact(null); setIsNewContactDialogOpen(true); }}>
          + New Contact
        </Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>
              Manage your contacts and leads. ({filteredContacts.length} contacts)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden sm:table-cell">Company</TableHead>
                  <TableHead className="hidden md:table-cell">Job Title</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Owner</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No contacts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map(contact => (
                    <TableRow key={contact._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={contact.avatar} alt={`${contact.firstName} ${contact.lastName}`} />
                            <AvatarFallback>{contact.firstName.charAt(0)}{contact.lastName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                            <div className="text-sm text-muted-foreground hidden sm:inline">{contact.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{contact.company}</TableCell>
                      <TableCell className="hidden md:table-cell">{contact.jobTitle}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={statusVariant[contact.status] || 'outline'}>{contact.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="hidden lg:inline">{contact.owner.name}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={contact.owner.avatar} alt={contact.owner.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{contact.owner.name.charAt(0)}</AvatarFallback>
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
                            <DropdownMenuItem onSelect={() => { setEditingContact(contact); setIsNewContactDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeletingContact(contact)} className="text-destructive">
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
      <NewContactDialog 
        open={isNewContactDialogOpen} 
        onOpenChange={setIsNewContactDialogOpen} 
        onContactCreated={handleContactCreated}
        onContactUpdated={handleContactUpdated}
        contact={editingContact}
      />
      <AlertDialog open={!!deletingContact} onOpenChange={(open) => !open && setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the contact "{deletingContact?.firstName} {deletingContact?.lastName}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Contact'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
