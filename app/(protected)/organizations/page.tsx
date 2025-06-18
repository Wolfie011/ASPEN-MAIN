"use client";

import { useEffect, useState, useCallback } from "react";
import Flow from "@/components/react-flow/flow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Workflow } from "lucide-react";
import { DataTable } from "@/components/DataTableOrganization/DataTable";
import { columns } from "./columns";
import { listObjects, listAllObjects } from "@/app/actions/object.action";
import { ObjectType } from "@/types/object/types";
import emitter from "@/lib/eventBus";

export default function OrganizationPage() {
  const [tab, setTab] = useState<"table" | "logic">("logic");
  const [objects, setObjects] = useState<ObjectType[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = useCallback(async () => {
    if (tab === "logic") {
      const res = await listAllObjects();
      if (res.state === "success" && res.data) {
        setObjects(res.data);
        setTotal(res.data.length);
      } else {
        setObjects([]);
        setTotal(0);
      }
    } else {
      const res = await listObjects(pageIndex + 1, pageSize);
      if (res.state === "success" && res.data) {
        setObjects(res.data.data || []);
        setTotal(res.data.total || 0);
      } else {
        setObjects([]);
        setTotal(0);
      }
    }
  }, [tab, pageIndex, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleCreated = () => fetchData();

    const handleDeleted = (objectId: string) => {
      setObjects((prev) => prev.filter((obj) => obj.id !== objectId));
      setTotal((prev) => prev - 1);
    };

    emitter.on("objectCreated", handleCreated);
    emitter.on("objectDeleted", handleDeleted);

    return () => {
      emitter.off("objectCreated", handleCreated);
      emitter.off("objectDeleted", handleDeleted);
    };
  }, [fetchData]);

  return (
    <main className="flex w-full flex-col items-center justify-center">
      <div className="w-full max-w-sm self-center">
        <Tabs defaultValue="logic" value={tab} onValueChange={(val) => setTab(val as "table" | "logic")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logic" className="flex items-center justify-center gap-2">
              <Workflow className="h-4 w-4" />
              <span>Widok Logiczny</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center justify-center gap-2">
              <Table className="h-4 w-4" />
              <span>Tabela</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <section className="h-[calc(100vh-150px)] w-full">
        {tab === "logic" ? (
          <Flow objects={objects} />
        ) : (
          <DataTable
            columns={columns}
            data={objects}
            total={total}
            onPaginationChange={(index, size) => {
              setPageIndex(index);
              setPageSize(size);
            }}
          />
        )}
      </section>
    </main>
  );
}
