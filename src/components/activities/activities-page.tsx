
import { SidebarTrigger } from '../ui/sidebar';
import { UserNav } from '../layout/user-nav';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function ActivitiesPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b-2 bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <SidebarTrigger className="md:hidden" />
        <h1 className="hidden text-lg font-semibold md:block">Activities</h1>
        <div className="relative ml-auto flex-1 md:grow-0"></div>
        <div className="hidden md:block">
          <UserNav />
        </div>
        <Button>+ New Task</Button>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
            <CardDescription>
              Your tasks, calls, and meetings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Calendar and activity list coming soon.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
