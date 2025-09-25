'use client';

import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal, Undo2, Redo2, DollarSign, Calendar, FileText } from 'lucide-react';
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
import { NewInvoiceDialog } from './new-invoice-dialog';
import { getInvoices, deleteInvoice } from '@/app/actions/invoices';
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
import { Invoice } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Sent': 'default',
  'Paid': 'default',
  'Draft': 'secondary',
  'Overdue': 'destructive',
  'Cancelled': 'outline',
};

export function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isNewInvoiceDialogOpen, setIsNewInvoiceDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Invoice[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedInvoices = await getInvoices();
      setInvoices(fetchedInvoices);
      setHistory([fetchedInvoices]);
      setHistoryIndex(0);
    });
  }, []);

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    startTransition(async () => {
      const fetchedInvoices = await getInvoices();
      setInvoices(fetchedInvoices);
      addToHistory(fetchedInvoices);
    });
  };

  const handleInvoiceUpdated = (updatedInvoice: Invoice) => {
    setEditingInvoice(null);
    startTransition(async () => {
      const fetchedInvoices = await getInvoices();
      setInvoices(fetchedInvoices);
      addToHistory(fetchedInvoices);
    });
  };

  const addToHistory = (newInvoices: Invoice[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newInvoices);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInvoices(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setInvoices(history[newIndex]);
    }
  };

  const handleDelete = async () => {
    if (!deletingInvoice) return;

    startTransition(async () => {
      const result = await deleteInvoice(deletingInvoice._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        const newInvoices = invoices.filter(i => i._id !== deletingInvoice._id);
        setInvoices(newInvoices);
        addToHistory(newInvoices);
        setDeletingInvoice(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="hidden text-lg font-semibold md:block">Invoices</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
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
        <Button onClick={() => { setEditingInvoice(null); setIsNewInvoiceDialogOpen(true); }}>
          + New Invoice
        </Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              Manage customer invoices and billing. ({filteredInvoices.length} invoices)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Due Date</TableHead>
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
                ) : filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map(invoice => (
                    <TableRow key={invoice._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {invoice.notes || 'No notes'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="font-medium">{invoice.customerName}</div>
                          <div className="text-sm text-muted-foreground">{invoice.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={statusVariant[invoice.status] || 'outline'}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(invoice.dueDate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="hidden lg:inline">{invoice.owner.name}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={invoice.owner.avatar} alt={invoice.owner.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{invoice.owner.name.charAt(0)}</AvatarFallback>
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
                            <DropdownMenuItem onSelect={() => { setEditingInvoice(invoice); setIsNewInvoiceDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeletingInvoice(invoice)} className="text-destructive">
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
      <NewInvoiceDialog 
        open={isNewInvoiceDialogOpen} 
        onOpenChange={setIsNewInvoiceDialogOpen} 
        onInvoiceCreated={handleInvoiceCreated}
        onInvoiceUpdated={handleInvoiceUpdated}
        invoice={editingInvoice}
      />
      <AlertDialog open={!!deletingInvoice} onOpenChange={(open) => !open && setDeletingInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the invoice "{deletingInvoice?.invoiceNumber}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}