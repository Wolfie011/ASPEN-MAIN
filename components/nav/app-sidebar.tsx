import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ChevronsUpDown } from "lucide-react";
import { NavUser } from "@/components/nav/nav-user";
import type { User as LuciaUser } from "lucia";

// Przykładowa konfiguracja nawigacji
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      items: [
        { title: "Użytkownicy", url: "/users" },
        { title: "Jednostki Organizacyjne", url: "/organizations" },
        { title: "Uprawnienia", url: "/permissions" },
      ],
    },
    {
      title: "API DOCS",
      url: "/api-docs",
      items: [{ title: "Dokumentacja API", url: "/api-docs" }],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  authUser: LuciaUser;
}

export function AppSidebar({ authUser, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          {/* Logo */}
          <div className="mx-auto flex size-10 aspect-square items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Image
              src="/icon.png"
              alt="MedicalTech"
              width={64}
              height={64}
              className="rounded-lg"
            />
          </div>

          {/* Tytuł aplikacji z tooltipem */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="grid flex-1 cursor-pointer text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MedicalTech</span>
                  <span className="truncate text-xs">
                    MedicalTech - Management APP
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <div className="text-sm font-semibold">MedicalTech</div>
                <div className="text-xs">MedicalTech - Management APP</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser authUser={authUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
