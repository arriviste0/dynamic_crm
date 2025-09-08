import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ProfilePage } from '@/components/profile/profile-page';

export default function Profile() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <ProfilePage />
      </SidebarInset>
    </SidebarProvider>
  );
}
