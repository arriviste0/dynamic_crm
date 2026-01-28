'use client';

import React from 'react';
import { ReportBuilder } from '@/components/reports/report-builder';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/layout/user-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/layout/main-nav';

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full min-h-screen flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="hidden text-lg font-semibold md:block">Reports & Analytics</h1>
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search reports..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] border-2 shadow-brutal"
              />
            </div>
            <div className="hidden md:block">
              <UserNav />
            </div>
            <Button>+ New Report</Button>
          </header>

          <main className="flex-1 space-y-4 p-4 md:p-8 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="mb-6">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Reports & Analytics</h2>
              <p className="text-muted-foreground">
                Generate comprehensive reports across all business modules with visualizations, filters, and multiple export formats.
              </p>
            </div>

            <ReportBuilder />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
