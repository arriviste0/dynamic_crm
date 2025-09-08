
import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { QuotesPage } from '@/components/quotes/quotes-page';

export default function Quotes() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <QuotesPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
