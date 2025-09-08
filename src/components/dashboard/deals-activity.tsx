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
];

const stageVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Closed Won': 'default',
    'Negotiation': 'secondary',
    'Proposal': 'secondary',
    'Qualifying': 'outline',
    'Prospect': 'outline'
}


export function DealsActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deals</CardTitle>
        <CardDescription>An overview of the latest deals in the pipeline.</CardDescription>
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
  );
}
