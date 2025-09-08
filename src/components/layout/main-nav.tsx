
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
          <h1 className="text-xl font-semibold">Flex CRM</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/" isActive={pathname === '/'}>
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/accounts" isActive={pathname.startsWith('/accounts')}>
              <Building2 />
              <span>Accounts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/contacts" isActive={pathname.startsWith('/contacts')}>
              <Users />
              <span>Contacts</span>
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
                  <SidebarMenuSubButton href="/deals" isActive={pathname === '/deals'}>All Deals</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/sales-pipeline" isActive={pathname === '/sales-pipeline'}>
                    Sales Pipeline
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton href="/activities" isActive={pathname.startsWith('/activities')}>
              <Inbox />
              <span>Activities</span>
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
                  <SidebarMenuSubButton href="/inventory" isActive={pathname === '/inventory'}>Products</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/services" isActive={pathname.startsWith('/services')}>
              <ConciergeBell />
              <span>Services</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/quotes" isActive={pathname.startsWith('/quotes')}>
              <FileText />
              <span>Quotes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/invoices" isActive={pathname.startsWith('/invoices')}>
              <DollarSign />
              <span>Invoices</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/tickets" isActive={pathname.startsWith('/tickets')}>
              <Ticket />
              <span>Tickets</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/projects" isActive={pathname.startsWith('/projects')}>
              <Package />
              <span>Projects</span>
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
            <SidebarMenuButton href="/settings" isActive={pathname.startsWith('/settings')}>
              <Cog />
              <span>Settings</span>
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
