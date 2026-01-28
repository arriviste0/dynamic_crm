import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SalesPipelinePage } from '@/components/sales-pipeline/sales-pipeline-page';

export default function SalesPipeline() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <SalesPipelinePage />
      </SidebarInset>
    </SidebarProvider>
  );
}
