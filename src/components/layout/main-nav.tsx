
'use client';
import Link from 'next/link';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  Cog,
  ConciergeBell,
  CreditCard,
  DollarSign,
  FileText,
  Handshake,
  Home,
  Inbox,
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Ticket,
  Users,
  Warehouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserNav } from './user-nav';
import React from 'react';
import { Card } from '../ui/card';
import { usePathname } from 'next/navigation';

export function MainNav() {
  const [open, setOpen] = React.useState({ deals: false, inventory: false });
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-6 text-primary" />
          <h1 className="text-xl font-semibold">Dynamic CRM</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/'}>
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/accounts')}>
              <Link href="/accounts">
                <Building2 />
                <span>Accounts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/contacts')}>
              <Link href="/contacts">
                <Users />
                <span>Contacts</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpen(prev => ({ ...prev, deals: !prev.deals }))}
              isActive={pathname.startsWith('/deals') || pathname.startsWith('/sales-pipeline')}
            >
              <Handshake />
              <span>Deals</span>
              <ChevronDown
                className={`ml-auto size-4 transition-transform duration-200 ${
                  open.deals ? 'rotate-180' : ''
                }`}
              />
            </SidebarMenuButton>
            {open.deals && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/deals'}>
                    <Link href="/deals">All Deals</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/sales-pipeline'}>
                    <Link href="/sales-pipeline">Sales Pipeline</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/activities')}>
              <Link href="/activities">
                <Inbox />
                <span>Activities</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpen(prev => ({ ...prev, inventory: !prev.inventory }))}
              isActive={pathname.startsWith('/inventory')}
            >
              <Warehouse />
              <span>Inventory</span>
              <ChevronDown
                className={`ml-auto size-4 transition-transform duration-200 ${
                  open.inventory ? 'rotate-180' : ''
                }`}
              />
            </SidebarMenuButton>
            {open.inventory && (
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild isActive={pathname === '/inventory'}>
                    <Link href="/inventory">Products</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/services')}>
              <Link href="/services">
                <ConciergeBell />
                <span>Services</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/quotes')}>
              <Link href="/quotes">
                <FileText />
                <span>Quotes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/invoices')}>
              <Link href="/invoices">
                <DollarSign />
                <span>Invoices</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/tickets')}>
              <Link href="/tickets">
                <Ticket />
                <span>Tickets</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/projects')}>
              <Link href="/projects">
                <Package />
                <span>Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/reports')}>
              <Link href="/reports">
                <BarChart3 />
                <span>Reports</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/billing')}>
              <Link href="/billing">
                <CreditCard />
                <span>Billing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/support')}>
              <Link href="/support">
                <CircleHelp />
                <span>Support</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-2">
        <Card className="p-3">
            <div className="mb-2">
                <h3 className="text-sm font-semibold">Upgrade to PRO</h3>
                <p className="text-xs text-muted-foreground">Unlock all features and get unlimited support.</p>
            </div>
            <Button size="sm" className="w-full">Upgrade</Button>
        </Card>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/profile')}>
              <Link href="/profile">
                <Users />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')}>
              <Link href="/settings">
                <Cog />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-card p-2 border-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="https://picsum.photos/100/100"
                alt="Admin"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-xs text-muted-foreground">
                admin@flexcrm.com
              </span>
            </div>
          </div>
          <UserNav />
        </div>
      </SidebarFooter>
    </>
  );
}
