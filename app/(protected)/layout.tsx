import { AppSidebar } from "@/components/nav/app-sidebar";
import NextBreadcrumb from "@/components/breadcrumb/DynamicBreadcrumb";
import { AccountActivationDialog } from "@/components/form/activate-account-form";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { authorize } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/nav/mode-toggle";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await authorize();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <SidebarProvider>
      <AppSidebar authUser={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <NextBreadcrumb homeElement={"Dashboard"} />
          </div>
          <ThemeToggle />
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 overflow-y-auto min-h-screen">
          {children}
          {user.active === false && <AccountActivationDialog />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
