
import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AccountsPage } from '@/components/accounts/accounts-page';

export default function Accounts() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <AccountsPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
