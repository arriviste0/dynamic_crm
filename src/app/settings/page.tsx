
import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SettingsPage } from '@/components/settings/settings-page';

export default function Settings() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <SettingsPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
