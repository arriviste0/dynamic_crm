
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { KpiCard } from './kpi-card';
import { CashFlowChart } from './cash-flow-chart';
import { RevenueChart } from './revenue-chart';
import { PipelineChart } from './pipeline-chart';
import { GaugeChartWidget } from './gauge-chart-widget';
import { DealsActivity } from './deals-activity';
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from '../layout/user-nav';
import { Button } from '../ui/button';
import React from 'react';

export function DashboardPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Dashboard</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px] border-2 shadow-brutal"
          />
        </div>
        <div className="hidden md:block">
         <UserNav />
        </div>
         <Button>+ New Record</Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            value="$45,231.89"
            change="+20.1% from last month"
            icon="dollar"
          />
          <KpiCard
            title="New Deals"
            value="+125"
            change="+18.2% from last month"
            icon="handshake"
          />
          <KpiCard
            title="Active Tickets"
            value="573"
            change="+19% from last month"
            icon="ticket"
          />
          <KpiCard
            title="Conversion Rate"
            value="25.4%"
            change="+5.4% from last month"
            icon="target"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <div className="col-span-1 lg:col-span-4">
            <CashFlowChart />
          </div>
          <div className="col-span-1 lg:col-span-3">
            <RevenueChart />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <GaugeChartWidget />
            <PipelineChart />
        </div>
        <div>
          <DealsActivity />
        </div>
      </main>
    </div>
  );
}
