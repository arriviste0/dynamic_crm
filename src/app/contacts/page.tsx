
import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ContactsPage } from '@/components/contacts/contacts-page';

export default function Contacts() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <ContactsPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
