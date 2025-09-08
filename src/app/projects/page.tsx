
import { MainNav } from '@/components/layout/main-nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ProjectsPage } from '@/components/projects/projects-page';

export default function Projects() {
  return (
    <SidebarProvider>
      <Sidebar>
        <MainNav />
      </Sidebar>
      <SidebarInset>
        <ProjectsPage />
      </SidebarInset>
    </SidebarProvider>
  );
}
