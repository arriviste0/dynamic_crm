
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
import Image from 'next/image';
import React, { useState, useTransition } from 'react';
import { NewAccountDialog } from './new-account-dialog';
import { getAccounts, deleteAccount } from '@/app/actions/accounts';
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
import { Account } from '@/lib/types';

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  'Active': 'default',
  'Customer': 'default',
  'Prospect': 'secondary',
  'Inactive': 'outline',
};

export function AccountsPage() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [isNewAccountDialogOpen, setIsNewAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Undo/Redo functionality
  const [history, setHistory] = useState<Account[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedAccounts = await getAccounts();
      setAccounts(fetchedAccounts);
      setHistory([fetchedAccounts]);
      setHistoryIndex(0);
    });
  }, []);

  const handleAccountCreated = (newAccount: Account) => {
    startTransition(async () => {
      const fetchedAccounts = await getAccounts();
      setAccounts(fetchedAccounts);
      addToHistory(fetchedAccounts);
    });
  };

  const handleAccountUpdated = (updatedAccount: Account) => {
    setEditingAccount(null);
    startTransition(async () => {
      const fetchedAccounts = await getAccounts();
      setAccounts(fetchedAccounts);
      addToHistory(fetchedAccounts);
    });
  };

  const addToHistory = (newAccounts: Account[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newAccounts);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAccounts(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAccounts(history[newIndex]);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    startTransition(async () => {
      const result = await deleteAccount(deletingAccount._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        const newAccounts = accounts.filter(a => a._id !== deletingAccount._id);
        setAccounts(newAccounts);
        addToHistory(newAccounts);
        setDeletingAccount(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const filteredAccounts = accounts.filter(account =>
    account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Accounts</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search accounts..."
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
        <Button onClick={() => { setEditingAccount(null); setIsNewAccountDialogOpen(true); }}>
          + New Account
        </Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>
              Manage your company and client accounts. ({filteredAccounts.length} accounts)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden sm:table-cell">Industry</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Contact</TableHead>
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
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map(account => (
                    <TableRow key={account._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={account.logo}
                            alt={account.companyName}
                            width={40}
                            height={40}
                            className="rounded-md"
                            data-ai-hint="company logo"
                          />
                          <div>
                            <div className="font-medium">{account.companyName}</div>
                            <div className="text-sm text-muted-foreground hidden sm:inline">{account.website}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{account.industry}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={statusVariant[account.status] || 'outline'}>{account.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          <div>{account.email}</div>
                          <div className="text-muted-foreground">{account.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="hidden lg:inline">{account.owner.name}</span>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={account.owner.avatar} alt={account.owner.name} data-ai-hint="user avatar" />
                            <AvatarFallback>{account.owner.name.charAt(0)}</AvatarFallback>
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
                            <DropdownMenuItem onSelect={() => { setEditingAccount(account); setIsNewAccountDialogOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setDeletingAccount(account)} className="text-destructive">
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
      <NewAccountDialog 
        open={isNewAccountDialogOpen} 
        onOpenChange={setIsNewAccountDialogOpen} 
        onAccountCreated={handleAccountCreated}
        onAccountUpdated={handleAccountUpdated}
        account={editingAccount}
      />
      <AlertDialog open={!!deletingAccount} onOpenChange={(open) => !open && setDeletingAccount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account "{deletingAccount?.companyName}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
