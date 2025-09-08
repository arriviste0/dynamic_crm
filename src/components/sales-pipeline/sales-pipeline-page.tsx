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
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '../ui/badge';
import React from 'react';

type Deal = {
  id: string;
  dealName: string;
  companyName: string;
  companyLogo: string;
  amount: string;
  stage: 'Prospect' | 'Qualifying' | 'Proposal' | 'Negotiation' | 'Closed Won';
  owner: { name: string; avatar: string };
};

const initialDeals: Deal[] = [
    { id: '1', dealName: 'Project Phoenix', companyName: 'Innovate Inc.', companyLogo: 'https://picsum.photos/40/40?random=1', amount: '$250,000', stage: 'Negotiation', owner: { name: 'Olivia Martin', avatar: 'https://picsum.photos/40/40?random=6' } },
    { id: '2', dealName: 'Quantum Leap', companyName: 'Synergy Corp', companyLogo: 'https://picsum.photos/40/40?random=2', amount: '$150,000', stage: 'Proposal', owner: { name: 'Liam Johnson', avatar: 'https://picsum.photos/40/40?random=7' } },
    { id: '3', dealName: 'Project Titan', companyName: 'Apex Solutions', companyLogo: 'https://picsum.photos/40/40?random=3', amount: '$350,000', stage: 'Qualifying', owner: { name: 'Emma Wilson', avatar: 'https://picsum.photos/40/40?random=8' } },
    { id: '4', dealName: 'Fusion Initiative', companyName: 'Momentum Dynamics', companyLogo: 'https://picsum.photos/40/40?random=4', amount: '$450,000', stage: 'Closed Won', owner: { name: 'Noah Brown', avatar: 'https://picsum.photos/40/40?random=9' } },
    { id: '5', dealName: 'Project Nebula', companyName: 'Stellar Tech', companyLogo: 'https://picsum.photos/40/40?random=5', amount: '$80,000', stage: 'Prospect', owner: { name: 'Ava Garcia', avatar: 'https://picsum.photos/40/40?random=10' } },
    { id: '6', dealName: 'Odyssey Venture', companyName: 'Horizon Enterprises', companyLogo: 'https://picsum.photos/40/40?random=11', amount: '$120,000', stage: 'Proposal', owner: { name: 'Sophia Lee', avatar: 'https://picsum.photos/40/40?random=12' } },
    { id: '7', dealName: 'Gateway Project', companyName: 'Pinnacle Corp', companyLogo: 'https://picsum.photos/40/40?random=13', amount: '$200,000', stage: 'Negotiation', owner: { name: 'James White', avatar: 'https://picsum.photos/40/40?random=14' } },
];

const stages: Deal['stage'][] = ['Prospect', 'Qualifying', 'Proposal', 'Negotiation', 'Closed Won'];

const DealCard = ({ deal }: { deal: Deal }) => (
  <Card className="mb-4">
    <CardHeader className="p-4">
      <div className="flex items-start justify-between">
        <CardTitle className="text-base">{deal.dealName}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <CardDescription>{deal.companyName}</CardDescription>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">{deal.amount}</span>
        <Avatar className="h-8 w-8">
          <AvatarImage src={deal.owner.avatar} alt={deal.owner.name} data-ai-hint="user avatar" />
          <AvatarFallback>{deal.owner.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </CardContent>
  </Card>
);

const PipelineColumn = ({ title, deals, onDragOver, onDrop }: { title: Deal['stage'], deals: Deal[], onDragOver: React.DragEventHandler<HTMLDivElement>, onDrop: React.DragEventHandler<HTMLDivElement> }) => (
  <div className="flex-1" onDragOver={onDragOver} onDrop={onDrop} data-stage={title}>
    <h2 className="text-lg font-semibold mb-4 capitalize px-1">{title} ({deals.length})</h2>
    <div className="bg-muted p-2 rounded-lg min-h-[500px]">
      {deals.map(deal => (
        <div key={deal.id} draggable onDragStart={(e) => e.dataTransfer.setData('dealId', deal.id)}>
          <DealCard deal={deal} />
        </div>
      ))}
    </div>
  </div>
);

export function SalesPipelinePage() {
    const [deals, setDeals] = React.useState(initialDeals);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dealId = e.dataTransfer.getData('dealId');
        const stage = e.currentTarget.dataset.stage as Deal['stage'];

        if (dealId && stage) {
            setDeals(currentDeals => currentDeals.map(deal =>
                deal.id === dealId ? { ...deal, stage } : deal
            ));
        }
    };


  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Sales Pipeline</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
        </div>
        <div className="hidden md:block">
         <UserNav />
        </div>
         <Button>+ New Deal</Button>
      </header>
      <main className="flex-1 space-x-4 p-4 md:p-8 flex overflow-x-auto">
        {stages.map(stage => (
            <PipelineColumn 
                key={stage}
                title={stage}
                deals={deals.filter(d => d.stage === stage)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            />
        ))}
      </main>
    </div>
  );
}
