import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { BillingPage } from '@/components/billing/billing-page';

export default function Billing() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <BillingPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
