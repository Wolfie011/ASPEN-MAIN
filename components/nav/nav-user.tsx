"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  Sparkles
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { SignOutForm } from "@/components/form/sign-out-form";
import { ThemeToggle } from "@/components/mode-toggle";
import { AuthUser } from "@/types/user.types";

export  function NavUser({ authUser }: { authUser: AuthUser }) {
  const { isMobile } = useSidebar();
  const {id, userName, firstName, lastName, email} = authUser;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger className="min-h-16" asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-2 flex"
                  >
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {(firstName[0] + lastName[0]).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {firstName} {lastName}
                      </span>
                      <span className="truncate text-muted-foreground/90">
                        {userName}
                      </span>
                      <span className="truncate text-muted-foreground/90">
                        {email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="start"
                className="max-w-[300px]"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <p className="text-sm">
                    {authUser.firstName} {authUser.lastName}
                  </p>
                  <p className="text-sm">{authUser.userName}</p>
                  <p className="text-sm">{authUser.email}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-72 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {(authUser.firstName[0] + authUser.lastName[0]).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {authUser.firstName} {authUser.lastName}
                  </span>
                  <span className="truncate text-muted-foreground/90">
                    {authUser.userName}
                  </span>
                  <span className="truncate text-muted-foreground/90">
                    {authUser.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="space-x-2">
                <BadgeCheck className="mr-2" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <CreditCard className="mr-2" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex flex-1 space-x-2 px-2 py-1">
              <SignOutForm />
              <ThemeToggle />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
