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
import Image from 'next/image';

const accounts = [
  {
    companyName: 'Innovate Inc.',
    companyLogo: 'https://picsum.photos/40/40?random=1',
    industry: 'Technology',
    owner: 'Olivia Martin',
    status: 'Active',
  },
  {
    companyName: 'Synergy Corp',
    companyLogo: 'https://picsum.photos/40/40?random=2',
    industry: 'Finance',
    owner: 'Liam Johnson',
    status: 'Active',
  },
  {
    companyName: 'Apex Solutions',
    companyLogo: 'https://picsum.photos/40/40?random=3',
    industry: 'Healthcare',
    owner: 'Emma Wilson',
    status: 'New',
  },
  {
    companyName: 'Momentum Dynamics',
    companyLogo: 'https://picsum.photos/40/40?random=4',
    industry: 'Manufacturing',
    owner: 'Noah Brown',
    status: 'Inactive',
  },
  {
    companyName: 'Stellar Tech',
    companyLogo: 'https://picsum.photos/40/40?random=5',
    industry: 'SaaS',
    owner: 'Ava Garcia',
    status: 'Active',
  },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Active: 'default',
  New: 'secondary',
  Inactive: 'destructive',
};

export function AccountsPage() {
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
          />
        </div>
        <div className="hidden md:block">
          <UserNav />
        </div>
        <Button>+ New Account</Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>
              A list of all accounts in your CRM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Industry
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Owner</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map(account => (
                  <TableRow key={account.companyName}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={account.companyLogo}
                          alt={account.companyName}
                          width={40}
                          height={40}
                          className="rounded-md"
                          data-ai-hint="company logo"
                        />
                        <div className="font-medium">{account.companyName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {account.industry}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {account.owner}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={statusVariant[account.status] || 'outline'}>
                        {account.status}
                      </Badge>
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
