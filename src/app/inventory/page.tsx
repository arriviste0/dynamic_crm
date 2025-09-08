import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { InventoryPage } from '@/components/inventory/inventory-page';

export default function Inventory() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <InventoryPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
