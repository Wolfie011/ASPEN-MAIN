"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/DataTableCommons/data-table-view-options";
import { CreateUserDialog } from "@/components/DataTableUser/createUserDialog";
import { UserDTO } from "@/types/user/types";

interface DataTableSimpleToolbarProps {
  table: Table<UserDTO>;
}

export function DataTableToolbar({ table }: DataTableSimpleToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Text Filter: Username */}
        <Input
          placeholder="Filtruj username..."
          value={(table.getColumn("userName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("userName")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* Text Filter: Email */}
        <Input
          placeholder="Filtruj email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* Reset Filters */}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* RIGHT SIDE: CreateUser + Table View Options */}
      <div className="flex items-center space-x-2">
        <CreateUserDialog />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
