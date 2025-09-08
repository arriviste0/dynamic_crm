
import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { TicketsPage } from '@/components/tickets/tickets-page';

export default function Tickets() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <TicketsPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
