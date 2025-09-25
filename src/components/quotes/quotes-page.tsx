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
import { NewQuoteDialog } from './new-quote-dialog';
import { getQuotes, deleteQuote } from '@/app/actions/quotes';
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
import { Quote } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Sent': 'default',
  'Accepted': 'default',
  'Draft': 'secondary',
  'Rejected': 'destructive',
  'Expired': 'outline',
};

export function QuotesPage() {
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [isNewQuoteDialogOpen, setIsNewQuoteDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Quote[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedQuotes = await getQuotes();
      setQuotes(fetchedQuotes);
      setHistory([fetchedQuotes]);
      setHistoryIndex(0);
    });
  }, []);

  const handleQuoteCreated = (newQuote: Quote) => {
    startTransition(async () => {
      const fetchedQuotes = await getQuotes();
      setQuotes(fetchedQuotes);
      addToHistory(fetchedQuotes);
    });
  };

  const handleQuoteUpdated = (updatedQuote: Quote) => {
    setEditingQuote(null);
    startTransition(async () => {
      const fetchedQuotes = await getQuotes();
      setQuotes(fetchedQuotes);
      addToHistory(fetchedQuotes);
    });
  };

  const addToHistory = (newQuotes: Quote[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newQuotes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setQuotes(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setQuotes(history[newIndex]);
    }
  };

  const handleDelete = async () => {
    if (!deletingQuote) return;

    startTransition(async () => {
      const result = await deleteQuote(deletingQuote._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        const newQuotes = quotes.filter(q => q._id !== deletingQuote._id);
        setQuotes(newQuotes);
        addToHistory(newQuotes);
        setDeletingQuote(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="hidden text-lg font-semibold md:block">Quotes</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search quotes..."
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
        <Button onClick={() => { setEditingQuote(null); setIsNewQuoteDialogOpen(true); }}>
          + New Quote
        </Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Quotes</CardTitle>
            <CardDescription>
              Manage sales quotes and proposals. ({filteredQuotes.length} quotes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Valid Until</TableHead>
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
                ) : filteredQuotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No quotes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotes.map(quote => (
                    <TableRow key={quote._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{quote.quoteNumber}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {quote.notes || 'No notes'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {quote.items.length} item{quote.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="font-medium">{quote.customerName}</div>
                          <div className="text-sm text-muted-foreground">{quote.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-medium">{formatCurrency(quote.totalAmount)}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={statusVariant[quote.status] || 'outline'}>
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(quote.validUntil)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="hidden lg:inline">{quote.owner.name}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={quote.owner.avatar} alt={quote.owner.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{quote.owner.name.charAt(0)}</AvatarFallback>
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
                            <DropdownMenuItem onSelect={() => { setEditingQuote(quote); setIsNewQuoteDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeletingQuote(quote)} className="text-destructive">
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
      <NewQuoteDialog 
        open={isNewQuoteDialogOpen} 
        onOpenChange={setIsNewQuoteDialogOpen} 
        onQuoteCreated={handleQuoteCreated}
        onQuoteUpdated={handleQuoteUpdated}
        quote={editingQuote}
      />
      <AlertDialog open={!!deletingQuote} onOpenChange={(open) => !open && setDeletingQuote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the quote "{deletingQuote?.quoteNumber}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Quote'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}