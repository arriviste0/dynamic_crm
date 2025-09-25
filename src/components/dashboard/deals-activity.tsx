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

const deals = [];

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
                    <span className="hidden lg:inline text-muted-foreground">No Owner</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>?</AvatarFallback>
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
