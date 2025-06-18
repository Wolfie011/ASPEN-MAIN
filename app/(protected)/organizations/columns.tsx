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
import { ObjectType } from "@/types/object/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export const columns: ColumnDef<ObjectType>[] = [
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
    accessorKey: "name",
    header: "Nazwa",
    cell: ({ row }) => <div className="truncate">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "description",
    header: "Opis",
    cell: ({ row }) => <div className="truncate">{row.getValue("description")}</div>
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Typ" />
    ),
    cell: ({ row }) => (
      <div className="truncate">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Poziom" />
    ),
    cell: ({ row }) => (
      <div className="truncate">{row.getValue("level")}</div>
    ),
  },
  {
    accessorKey: "parentId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nadrzędny" />
    ),
    cell: ({ row }) => (
      <div className="truncate">{row.getValue("parentId")}</div>
    ),
  },
];
