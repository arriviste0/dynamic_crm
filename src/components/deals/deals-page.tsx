
'use client';

import { Input } from '@/components/ui/input';
import { Search, MoreHorizontal } from 'lucide-react';
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
import { NewDealDialog } from './new-deal-dialog';
import { getDeals, deleteDeal } from '@/app/actions/deals';
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
import { formatBusinessModelLabel } from '@/lib/business-models';

type Deal = {
  _id: string;
  dealName: string;
  companyName: string;
  companyLogo: string;
  amount: string;
  businessModel?: 'B2B' | 'B2C' | 'BCB';
  stage: string;
  owner: { name: string; avatar: string };
};

const stageVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Closed Won': 'default',
    'Negotiation': 'secondary',
    'Proposal': 'secondary',
    'Qualifying': 'outline',
    'Prospect': 'outline',
    'Closed Lost': 'destructive'
}

export function DealsPage() {
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [isNewDealDialogOpen, setIsNewDealDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    startTransition(async () => {
      const fetchedDeals = await getDeals();
      setDeals(fetchedDeals);
    });
  }, []);

  const handleDealCreated = (newDeal: Deal) => {
    startTransition(async () => {
        const fetchedDeals = await getDeals();
        setDeals(fetchedDeals);
    });
  }

  const handleDealUpdated = (updatedDeal: Deal) => {
    setEditingDeal(null);
    startTransition(async () => {
        const fetchedDeals = await getDeals();
        setDeals(fetchedDeals);
    });
  }
  
  const handleDelete = async () => {
    if (!deletingDeal) return;

    startTransition(async () => {
      const result = await deleteDeal(deletingDeal._id);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        setDeals(deals.filter(d => d._id !== deletingDeal._id));
        setDeletingDeal(null);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Deals</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search deals..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] border-2 shadow-brutal"
          />
        </div>
        <div className="hidden md:block">
         <UserNav />
        </div>
         <Button onClick={() => { setEditingDeal(null); setIsNewDealDialogOpen(true); }}>+ New Deal</Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>All Deals</CardTitle>
            <CardDescription>An overview of all deals in the pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Stage</TableHead>
                  <TableHead className="hidden lg:table-cell">Business Model</TableHead>
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
                ) : deals.map(deal => (
                  <TableRow key={deal._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={deal.companyLogo}
                          alt={deal.companyName}
                          width={40}
                          height={40}
                          className="rounded-md"
                          data-ai-hint="company logo"
                        />
                        <div>
                          <div className="font-medium">{deal.dealName}</div>
                          <div className="text-sm text-muted-foreground hidden sm:inline">{deal.companyName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono">{deal.amount}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={stageVariant[deal.stage] || 'outline'}>{deal.stage}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {deal.businessModel ? (
                        <Badge variant="secondary">{formatBusinessModelLabel(deal.businessModel)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="hidden lg:inline">{deal.owner.name}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={deal.owner.avatar} alt={deal.owner.name} data-ai-hint="user avatar" />
                          <AvatarFallback>{deal.owner.name.charAt(0)}</AvatarFallback>
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
                          <DropdownMenuItem onSelect={() => { setEditingDeal(deal); setIsNewDealDialogOpen(true); }}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setDeletingDeal(deal)} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <NewDealDialog 
        open={isNewDealDialogOpen} 
        onOpenChange={setIsNewDealDialogOpen} 
        onDealCreated={handleDealCreated}
        onDealUpdated={handleDealUpdated}
        deal={editingDeal}
      />
      <AlertDialog open={!!deletingDeal} onOpenChange={(open) => !open && setDeletingDeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the deal "{deletingDeal?.dealName}"? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete Deal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
