import { MainNav } from '@/components/layout/main-nav';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <DashboardPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
