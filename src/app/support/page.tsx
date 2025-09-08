import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SupportPage } from '@/components/support/support-page';

export default function Support() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <SupportPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
