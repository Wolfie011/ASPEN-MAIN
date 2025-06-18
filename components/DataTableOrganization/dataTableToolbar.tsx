"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/DataTableCommons/data-table-view-options";
import { ObjectType } from "@/types/object/types";

interface DataTableSimpleToolbarProps {
  table: Table<ObjectType>;
}

export function DataTableToolbar({ table }: DataTableSimpleToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Text Filter: type */}
        <Input
          placeholder="Filtruj nazwe..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* Text Filter: type */}
        <Input
          placeholder="Filtruj typ..."
          value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("type")?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {/* Text Filter: level */}
        <Input
          placeholder="Filtruj poziom..."
          value={(table.getColumn("level")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("level")?.setFilterValue(event.target.value)}
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

      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
