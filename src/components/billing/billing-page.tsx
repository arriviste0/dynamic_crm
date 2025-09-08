
'use client';

import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from '../layout/user-nav';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileDown } from 'lucide-react';

const billingHistory = [
    { invoice: 'INV001', date: '2024-01-15', amount: '$250.00', status: 'Paid' },
    { invoice: 'INV002', date: '2024-02-20', amount: '$150.00', status: 'Paid' },
    { invoice: 'INV003', date: '2024-03-10', amount: '$350.00', status: 'Paid' },
    { invoice: 'INV004', date: '2024-04-05', amount: '$450.00', status: 'Paid' },
    { invoice: 'INV005', date: '2024-05-25', amount: '$80.00', status: 'Paid' },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  Paid: 'default',
  Pending: 'secondary',
  Overdue: 'destructive',
};

export function BillingPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Billing</h1>
        <div className="relative ml-auto flex-1 md:grow-0"></div>
        <div className="hidden md:block">
          <UserNav />
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are currently on the Pro plan.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <p className="text-4xl font-bold">$99/mo</p>
                <p className="text-muted-foreground">Billed monthly. Your next bill is on July 31, 2024.</p>
              </div>
              <Button variant="outline" className="mt-4 sm:mt-0">Upgrade Plan</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Your default payment method.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-muted rounded-md flex items-center justify-center font-mono text-sm">
                        Visa
                    </div>
                    <div>
                        <p className="font-medium">Visa ending in 1234</p>
                        <p className="text-muted-foreground text-sm">Expires 12/2026</p>
                    </div>
                </div>
              <Button variant="outline" className="mt-4 sm:mt-0">Update Payment Method</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View your past invoices.</CardDescription>
              </div>
               <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export All
                </span>
              </Button>
            </CardHeader>
            <CardContent>
               <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {billingHistory.map(item => (
                            <TableRow key={item.invoice}>
                                <TableCell className="font-medium">{item.invoice}</TableCell>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{item.amount}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={statusVariant[item.status] || 'default'}>{item.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
