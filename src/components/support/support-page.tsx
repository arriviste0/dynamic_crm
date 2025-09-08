
'use client';

import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from '../layout/user-nav';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LifeBuoy, BookOpen, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function SupportPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Support</h1>
        <div className="relative ml-auto flex-1 md:grow-0"></div>
        <div className="hidden md:block">
          <UserNav />
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="grid gap-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold">How can we help?</h2>
                <p className="text-muted-foreground">Get in touch with us or find an answer yourself.</p>
            </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="#">
              <Card className="h-full hover:bg-accent transition-colors">
                <CardHeader className="flex flex-row items-center gap-4">
                  <LifeBuoy className="h-8 w-8" />
                  <div>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>Speak to our support team.</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
             <Link href="#">
              <Card className="h-full hover:bg-accent transition-colors">
                <CardHeader className="flex flex-row items-center gap-4">
                  <BookOpen className="h-8 w-8" />
                  <div>
                    <CardTitle>Knowledge Base</CardTitle>
                    <CardDescription>Browse our help articles.</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
             <Link href="#">
              <Card className="h-full hover:bg-accent transition-colors">
                <CardHeader className="flex flex-row items-center gap-4">
                  <MessageSquare className="h-8 w-8" />
                  <div>
                    <CardTitle>Community Forum</CardTitle>
                    <CardDescription>Ask the community.</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
           <Card>
            <CardHeader>
              <CardTitle>Submit a Ticket</CardTitle>
              <CardDescription>We'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Enter the subject of your issue" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your issue in detail" className="min-h-[150px]" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="attachment">Attachment</Label>
                 <Input id="attachment" type="file" />
              </div>
              <Button>Submit Ticket</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
