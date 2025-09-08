import { Input } from '@/components/ui/input';
import { Search, FileDown } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

const invoices = [
  {
    invoice: 'INV001',
    customer: 'Innovate Inc.',
    date: '2024-01-15',
    amount: '$250.00',
    status: 'Paid',
  },
  {
    invoice: 'INV002',
    customer: 'Synergy Corp',
    date: '2024-02-20',
    amount: '$150.00',
    status: 'Pending',
  },
  {
    invoice: 'INV003',
    customer: 'Apex Solutions',
    date: '2024-03-10',
    amount: '$350.00',
    status: 'Overdue',
  },
  {
    invoice: 'INV004',
    customer: 'Momentum Dynamics',
    date: '2024-04-05',
    amount: '$450.00',
    status: 'Paid',
  },
  {
    invoice: 'INV005',
    customer: 'Stellar Tech',
    date: '2024-05-25',
    amount: '$80.00',
    status: 'Paid',
  },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Paid: 'default',
  Pending: 'secondary',
  Overdue: 'destructive',
};

export function InvoicesPage() {
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
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <div className="hidden md:block">
            <UserNav />
          </div>
          <Button>+ New Invoice</Button>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              A list of all invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Customer
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(invoice => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className="font-medium">
                      {invoice.invoice}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {invoice.customer}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {invoice.date}
                    </TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={statusVariant[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                     <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
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
    </div>
  );
}
