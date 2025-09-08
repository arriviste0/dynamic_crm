import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ActivitiesPage } from '@/components/activities/activities-page';

export default function Activities() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <ActivitiesPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
