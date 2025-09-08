import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';

const deals = [
  {
    dealName: 'Project Phoenix',
    companyName: 'Innovate Inc.',
    companyLogo: 'https://picsum.photos/40/40?random=1',
    amount: '$250,000',
    stage: 'Negotiation',
    owner: { name: 'Olivia Martin', avatar: 'https://picsum.photos/40/40?random=6' },
  },
  {
    dealName: 'Quantum Leap',
    companyName: 'Synergy Corp',
    companyLogo: 'https://picsum.photos/40/40?random=2',
    amount: '$150,000',
    stage: 'Proposal',
    owner: { name: 'Liam Johnson', avatar: 'https://picsum.photos/40/40?random=7' },
  },
  {
    dealName: 'Project Titan',
    companyName: 'Apex Solutions',
    companyLogo: 'https://picsum.photos/40/40?random=3',
    amount: '$350,000',
    stage: 'Qualifying',
    owner: { name: 'Emma Wilson', avatar: 'https://picsum.photos/40/40?random=8' },
  },
  {
    dealName: 'Fusion Initiative',
    companyName: 'Momentum Dynamics',
    companyLogo: 'https://picsum.photos/40/40?random=4',
    amount: '$450,000',
    stage: 'Closed Won',
    owner: { name: 'Noah Brown', avatar: 'https://picsum.photos/40/40?random=9' },
  },
  {
    dealName: 'Project Nebula',
    companyName: 'Stellar Tech',
    companyLogo: 'https://picsum.photos/40/40?random=5',
    amount: '$80,000',
    stage: 'Prospect',
    owner: { name: 'Ava Garcia', avatar: 'https://picsum.photos/40/40?random=10' },
  },
   {
    dealName: 'Odyssey Venture',
    companyName: 'Horizon Enterprises',
    companyLogo: 'https://picsum.photos/40/40?random=11',
    amount: '$120,000',
    stage: 'Proposal',
    owner: { name: 'Sophia Lee', avatar: 'https://picsum.photos/40/40?random=12' },
  },
  {
    dealName: 'Gateway Project',
    companyName: 'Pinnacle Corp',
    companyLogo: 'https://picsum.photos/40/40?random=13',
    amount: '$200,000',
    stage: 'Negotiation',
    owner: { name: 'James White', avatar: 'https://picsum.photos/40/40?random=14' },
  },
  {
    dealName: 'Catalyst Campaign',
    companyName: 'Vertex Industries',
    companyLogo: 'https://picsum.photos/40/40?random=15',
    amount: '$95,000',
    stage: 'Closed Lost',
    owner: { name: 'Isabella Rodriguez', avatar: 'https://picsum.photos/40/40?random=16' },
  },
];

const stageVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Closed Won': 'default',
    'Negotiation': 'secondary',
    'Proposal': 'secondary',
    'Qualifying': 'outline',
    'Prospect': 'outline',
    'Closed Lost': 'destructive'
}


export function DealsPage() {
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
         <Button>+ New Deal</Button>
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
                  <TableHead className="text-right">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map(deal => (
                  <TableRow key={deal.dealName}>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="hidden lg:inline">{deal.owner.name}</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={deal.owner.avatar} alt={deal.owner.name} data-ai-hint="user avatar" />
                          <AvatarFallback>{deal.owner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
