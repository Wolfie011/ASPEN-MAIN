import { AppSidebar } from "@/components/nav/app-sidebar";
import NextBreadcrumb from "@/components/breadcrumb/NextBreadcrumb";
// import { AccountActivationDialog } from "@/components/forms/activate-account-form";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authorize } from "@/lib/utils_backend";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, session } = await authorize();

  // if (!session) {
  //   redirect("/sign-in");
  // }

  return (
    <SidebarProvider>
      <AppSidebar authUser={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <NextBreadcrumb homeElement={"Dashboard"} />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
            {children}
            {/* {user.active === false && <AccountActivationDialog />} */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
