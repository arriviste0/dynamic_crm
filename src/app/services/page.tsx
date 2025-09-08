import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ServicesPage } from '@/components/services/services-page';

export default function Services() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <ServicesPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
