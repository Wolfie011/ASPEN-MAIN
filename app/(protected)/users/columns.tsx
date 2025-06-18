"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/DataTableCommons/data-table-column-header";
import { Check, MoreHorizontal, X } from "lucide-react";
import { UserDTO } from "@/types/user/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import emitter from "@/lib/eventBus";
import { deleteUser } from "@/app/actions/user.action";

const onDeleteUser = async (userId: string) => {
  try {
    const res = await deleteUser(userId);

    if (res.state !== "success") {
      toast({
        variant: "destructive",
        description: res.error || "Błąd podczas usuwania użytkownika",
      });
      return;
    }

    toast({
      variant: "default",
      description: res.success || "Użytkownik został usunięty",
    });

    emitter.emit("userDeleted", userId);
  } catch (err) {
    console.error("An unexpected error occurred", err);
    toast({
      variant: "destructive",
      description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    });
  }
};

export const columns: ColumnDef<UserDTO>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
  },
  {
    accessorKey: "id",
    header: "Identyfikator",
    cell: ({ row }) => <div className="truncate">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "permissionRole",
    header: "Uprawnienia",
    cell: ({ row }) => {
      const roles: { id: string; tag: string }[] = row.getValue("permissionRole") || [];
      if (roles.length === 0) return <span>Brak przypisanych uprawnień</span>;
      return (
        <ul className="list-disc list-inside space-y-1">
          {roles.map(({ id, tag }) => (
            <div key={id}>
              <Badge variant="outline">{tag}</Badge>
            </div>
          ))}
        </ul>
      );
    },
  },
  {
    accessorKey: "roleJob",
    header: "Role",
    cell: ({ row }) => {
      const roles: { id: string; tag: string }[] = row.getValue("roleJob") || [];
      if (roles.length === 0) return <span>Brak przypisanych ról</span>;
      return (
        <ul className="list-disc list-inside space-y-1">
          {roles.map(({ id, tag }) => (
            <div key={id}>
              <Badge variant="outline">{tag}</Badge>
            </div>
          ))}
        </ul>
      );
    },
  },
  {
    accessorKey: "userName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nazwa użytkownika" />
    ),
    cell: ({ row }) => (
      <div className="truncate">{row.getValue("userName")}</div>
    ),
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Imię" />
    ),
    cell: ({ row }) => (
      <div className="truncate">{row.getValue("firstName")}</div>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nazwisko" />
    ),
    cell: ({ row }) => (
      <div className="truncate">{row.getValue("lastName")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="truncate">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => <div className="truncate">{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("active") as boolean;
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-nowrap p-1 rounded-sm"
        >
          {isActive ? (
            <>
              <Check className="w-4 h-4 text-blue-500" />
              Aktywne
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-red-500" />
              Nie Aktywowane
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "units",
    header: "Jednostki",
    cell: ({ row }) => {
      const units: { id: string; tag: string }[] = row.getValue("units") || [];
      if (units.length === 0) return <span>Brak przypisanych jednostek</span>;
      return (
        <ul className="list-disc list-inside space-y-1">
          {units.map(({ id, tag }) => (
            <div key={id}>
              <Badge variant="outline">{tag}</Badge>
            </div>
          ))}
        </ul>
      );
    },
  },
  {
    id: "actions",
    cell: function ActionsCell({ row }) {
      return (
        <div className="flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akcje</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(row.original.id);
                  toast({
                    title: "Sukces",
                    description: "Skopiowano ID użytkownika!",
                  });
                }}
              >
                <Button
                  variant="ghost"
                  className="h-full w-full text-blue-500 hover:text-blue-700"
                >
                  Kopiuj ID użytkownika
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => emitter.emit("openUserDialog", row.original)}
              >
                <Button
                  variant="ghost"
                  className="h-full w-full text-green-500 hover:text-green-700"
                >
                  Edytuj użytkownika
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteUser(row.original.id)}>
                <Button
                  variant="ghost"
                  className="h-full w-full text-red-500 hover:text-red-700"
                >
                  Usuń użytkownika
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
