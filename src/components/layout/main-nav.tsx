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
  DollarSign,
  Handshake,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserNav } from './user-nav';
import React from 'react';
import { Card } from '../ui/card';

export function MainNav() {
  const [open, setOpen] = React.useState({ deals: false });

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-6 text-primary" />
          <h1 className="text-xl font-semibold">MetaTenant</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" isActive>
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <Building2 />
              <span>Accounts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <Users />
              <span>Contacts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setOpen(prev => ({ ...prev, deals: !prev.deals }))}
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
                  <SidebarMenuSubButton href="#">All Deals</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="#" isActive>
                    Sales Pipeline
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="#">
                    Service Pipeline
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <DollarSign />
              <span>Invoices</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 space-y-2">
        <Card className="p-4 bg-primary/20">
          <h3 className="font-bold text-lg mb-2">Upgrade to PRO</h3>
          <p className="text-sm mb-4">Upgrade your account to Pro and enjoy.</p>
          <Button variant="default" className="w-full">Upgrade plan</Button>
        </Card>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <Cog />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <CircleHelp />
              <span>Help</span>
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
                admin@metatenant.com
              </span>
            </div>
          </div>
          <UserNav />
        </div>
      </SidebarFooter>
    </>
  );
}
