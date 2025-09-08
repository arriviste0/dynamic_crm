import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { DealsPage } from '@/components/deals/deals-page';

export default function Deals() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <DealsPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
