import * as React from "react";
import Image from "next/image";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { ChevronsUpDown } from "lucide-react";
import { NavUser } from "./nav-user";
import { AuthUser } from "@/types/user.types";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      items: [
        {
          title: "Użytkownicy",
          url: "/user",
          isActive: true,
        },
        {
          title: "Jednostki Organizacyjne",
          url: "/unit",
        },
        {
          title: "Uprawnienia",
          url: "/permission",
        },
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  authUser: AuthUser;
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
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg mx-auto bg-sidebar-primary text-sidebar-primary-foreground">
            <Image
              src="/icon.png"
              width={64}
              height={64}
              alt="MedicalTech"
              className="rounded-lg"
            />
          </div>
          {/* App Title */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="grid flex-1 text-left text-sm leading-tight cursor-pointer">
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
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
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
