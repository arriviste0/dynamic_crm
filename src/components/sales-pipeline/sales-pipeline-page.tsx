'use client';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import React, { useEffect, useState } from 'react';
import { getDeals } from '@/app/actions/deals';
import { useToast } from '@/hooks/use-toast';
import { NewDealDialog } from './new-deal-dialog';

type Deal = {
  _id: string;
  dealName: string;
  companyName: string;
  amount: string;
  stage: 'Prospect' | 'Qualifying' | 'Proposal' | 'Negotiation' | 'Closed Won';
  createdAt: string;
  updatedAt: string;
  fieldOrder?: string[];
};

export default function SalesPipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const { toast } = useToast();

  const loadDeals = async () => {
    try {
      const result = await getDeals();
      if (result.success) {
        setDeals(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load deals'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load deals'
      });
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const renderDeals = (stage: Deal['stage']) => {
    return deals
      .filter(deal => deal.stage === stage)
      .map(deal => (
        <Card key={deal._id} className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(deal.companyName)}`} />
                <AvatarFallback>{deal.companyName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-medium">
                  {deal.dealName}
                </CardTitle>
                <CardDescription className="text-xs">
                  {deal.companyName}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{deal.stage}</Badge>
              <span className="text-sm font-medium">{deal.amount}</span>
            </div>
          </CardContent>
        </Card>
      ));
  };

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-lg font-bold">Sales Pipeline</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setIsNewDealOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container grid flex-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Prospect Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Prospect</h2>
            {renderDeals('Prospect')}
          </div>

          {/* Qualifying Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Qualifying</h2>
            {renderDeals('Qualifying')}
          </div>

          {/* Proposal Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Proposal</h2>
            {renderDeals('Proposal')}
          </div>

          {/* Negotiation Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Negotiation</h2>
            {renderDeals('Negotiation')}
          </div>

          {/* Closed Won Column */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Closed Won</h2>
            {renderDeals('Closed Won')}
          </div>
        </div>
      </div>

      <NewDealDialog
        open={isNewDealOpen}
        onOpenChange={setIsNewDealOpen}
        onDealCreated={loadDeals}
      />
    </div>
  );
}


