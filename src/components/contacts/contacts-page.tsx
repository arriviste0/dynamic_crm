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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const contacts = [
  {
    name: 'Olivia Martin',
    avatar: 'https://picsum.photos/40/40?random=6',
    email: 'olivia.martin@innovate.com',
    companyName: 'Innovate Inc.',
  },
  {
    name: 'Liam Johnson',
    avatar: 'https://picsum.photos/40/40?random=7',
    email: 'liam.johnson@synergy.com',
    companyName: 'Synergy Corp',
  },
  {
    name: 'Emma Wilson',
    avatar: 'https://picsum.photos/40/40?random=8',
    email: 'emma.wilson@apex.com',
    companyName: 'Apex Solutions',
  },
  {
    name: 'Noah Brown',
    avatar: 'https://picsum.photos/40/40?random=9',
    email: 'noah.brown@momentum.com',
    companyName: 'Momentum Dynamics',
  },
  {
    name: 'Ava Garcia',
    avatar: 'https://picsum.photos/40/40?random=10',
    email: 'ava.garcia@stellar.com',
    companyName: 'Stellar Tech',
  },
];

export function ContactsPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Contacts</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] border-2 shadow-brutal"
          />
        </div>
        <div className="hidden md:block">
          <UserNav />
        </div>
        <Button>+ New Contact</Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>
              A list of all contacts in your CRM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Company
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map(contact => (
                  <TableRow key={contact.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={contact.avatar}
                            alt={contact.name}
                            data-ai-hint="user avatar"
                          />
                          <AvatarFallback>
                            {contact.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{contact.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {contact.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {contact.companyName}
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
