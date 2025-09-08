
import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { InvoicesPage } from '@/components/invoices/invoices-page';

export default function Invoices() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <InvoicesPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
