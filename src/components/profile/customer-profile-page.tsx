'use client';

import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from '../layout/user-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CustomerProfilePage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Customer Profile</h1>
        <div className="relative ml-auto flex-1 md:grow-0"></div>
        <div className="hidden md:block">
          <UserNav />
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Customer Profile</CardTitle>
            <CardDescription>Limited view for customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://picsum.photos/100/100?random=7" alt="Customer" data-ai-hint="user avatar" />
                <AvatarFallback>CU</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-lg font-semibold">Customer User</div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customer-name">Name</Label>
                <Input id="customer-name" defaultValue="Customer User" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input id="customer-email" type="email" defaultValue="customer@company.com" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone</Label>
                <Input id="customer-phone" type="tel" defaultValue="+1 (555) 123-4567" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-company">Company</Label>
                <Input id="customer-company" defaultValue="Customer Company" disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
