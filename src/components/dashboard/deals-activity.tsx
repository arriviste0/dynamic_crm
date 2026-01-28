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

const stageVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Closed Won': 'default',
    'Negotiation': 'secondary',
    'Proposal': 'secondary',
    'Qualifying': 'outline',
    'Prospect': 'outline'
}

interface DealsActivityProps {
  deals?: any[];
}

export function DealsActivity({ deals = [] }: DealsActivityProps) {
  // Get the 5 most recent deals
  const recentDeals = deals.slice(0, 5);

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
            {recentDeals.length > 0 ? (
              recentDeals.map((deal) => (
                <TableRow key={deal._id || deal.dealName}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={deal.companyLogo || 'https://via.placeholder.com/40'}
                        alt={deal.companyName || 'Company'}
                        width={40}
                        height={40}
                        className="rounded-md"
                        data-ai-hint="company logo"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/40';
                        }}
                      />
                      <div>
                        <div className="font-medium">{deal.dealName}</div>
                        <div className="text-sm text-muted-foreground hidden sm:inline">{deal.companyName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-mono">${deal.amount?.toLocaleString() || '0'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={stageVariant[deal.stage] || 'outline'}>{deal.stage || 'Prospect'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="hidden lg:inline text-muted-foreground">{deal.owner?.name || 'No Owner'}</span>
                      <Avatar className="h-8 w-8">
                        {deal.owner?.avatar && <AvatarImage src={deal.owner.avatar} />}
                        <AvatarFallback>{deal.owner?.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No deals found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
