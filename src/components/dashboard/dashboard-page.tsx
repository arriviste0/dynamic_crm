
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
import React, { useEffect, useState, useTransition } from 'react';
import { getAccounts } from '@/app/actions/accounts';
import { getDeals } from '@/app/actions/deals';
import { getInvoices } from '@/app/actions/invoices';
import { getTickets } from '@/app/actions/tickets';

export function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    dealCount: 0,
    ticketCount: 0,
    conversionRate: 0,
  });
  const [dashboardData, setDashboardData] = useState<{
    accounts: any[];
    deals: any[];
    invoices: any[];
    tickets: any[];
  }>({
    accounts: [],
    deals: [],
    invoices: [],
    tickets: [],
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const [accounts, deals, invoices, tickets] = await Promise.all([
          getAccounts(),
          getDeals(),
          getInvoices(),
          getTickets(),
        ]);

        console.log('Dashboard Data:', { accounts, deals, invoices, tickets });

        // Set dashboard data
        const accountsData = Array.isArray(accounts) ? accounts : [];
        const dealsData = Array.isArray(deals) ? deals : [];
        const invoicesData = Array.isArray(invoices) ? invoices : [];
        const ticketsData = Array.isArray(tickets) ? tickets : [];

        setDashboardData({
          accounts: accountsData,
          deals: dealsData,
          invoices: invoicesData,
          tickets: ticketsData,
        });

        // Calculate metrics
        const totalRevenue = invoicesData.reduce((sum: number, inv: any) => {
          return sum + (inv.totalAmount || 0);
        }, 0);

        const totalAccounts = accountsData.length;
        const ticketCount = ticketsData.length;
        const activeAccounts = accountsData.filter((a: any) => a.status === 'Active').length;
        const conversionRate = accountsData.length > 0 ? (activeAccounts / accountsData.length) * 100 : 0;

        setMetrics({
          totalRevenue,
          dealCount: totalAccounts,
          ticketCount,
          conversionRate,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      }
    });
  }, []);

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
      <main className="flex-1 space-y-4 p-4 md:p-8 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <KpiCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            change="+20.1% from last month"
            icon="dollar"
            isPositive={true}
          />
          <KpiCard
            title="Total Accounts"
            value={metrics.dealCount}
            change={`${Math.round(metrics.conversionRate)}% Active`}
            icon="building"
            isPositive={true}
          />
          <KpiCard
            title="Active Tickets"
            value={metrics.ticketCount}
            change="+19% from last month"
            icon="ticket"
            isPositive={true}
          />
          <KpiCard
            title="Conversion Rate"
            value={Math.round(metrics.conversionRate)}
            change="+5.4% from last month"
            icon="target"
            isPositive={true}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="col-span-1 lg:col-span-4 transition-all duration-300 hover:shadow-lg">
            <CashFlowChart invoices={dashboardData.invoices} />
          </div>
          <div className="col-span-1 lg:col-span-3 transition-all duration-300 hover:shadow-lg">
            <RevenueChart invoices={dashboardData.invoices} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="transition-all duration-300 hover:shadow-lg">
              <GaugeChartWidget tickets={dashboardData.tickets} />
            </div>
            <div className="transition-all duration-300 hover:shadow-lg">
              <PipelineChart deals={dashboardData.deals} />
            </div>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <DealsActivity deals={dashboardData.deals} />
        </div>
      </main>
    </div>
  );
}
