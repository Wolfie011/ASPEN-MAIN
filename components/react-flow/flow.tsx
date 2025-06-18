"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";

import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  Node,
  Connection,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import "reactflow/dist/style.css";

import { nodeTypes } from "./nodes";
import { edgeTypes, createEdges } from "./edges";
import { createNodes } from "./utils";
import { ObjectType } from "@/types/object/types";
import { CreateObjectDialog } from "@/components/DataTableOrganization/CreateObjectDialog";
import { deleteObject, updateObject } from "@/app/actions/object.action";
import emitter from "@/lib/eventBus";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

type Props = { objects: ObjectType[] };

export default function Flow({ objects }: Props) {
  const { theme, resolvedTheme } = useTheme();

  const [data, setData] = useState<ObjectType[]>(objects);
  const [dialogParent, setDialogParent] = useState<string | null>(null);
  const [editObject, setEditObject] = useState<ObjectType | null>(null);

  // ⚙️ Stała funkcja do otwierania dialogu
  const onAddChild = useCallback((parentId: string) => {
    setDialogParent(parentId);
  }, []);

  const nodes = useMemo(
    () => createNodes(data, onAddChild),
    [data, onAddChild]
  );
  const edges = useMemo(() => createEdges(data), [data]);
  const showAddRootButton = nodes.length === 0;
  const [createRoot, setCreateRoot] = useState(false);

  useEffect(() => {
    setData(objects);
  }, [objects]);

  useEffect(() => {
    const handler = (id: string) => {
      const obj = data.find((o) => o.id === id);
      if (obj) setEditObject(obj);
    };

    emitter.on("objectEditRequested", handler);
    return () => emitter.off("objectEditRequested", handler);
  }, [data]);

  useEffect(() => {
    const handler = async (id: string) => {
      const res = await deleteObject(id);
      if (res.state === "success") {
        toast({ description: "Obiekt usunięty" });
        emitter.emit("objectDeleted", id);
      } else {
        toast({ variant: "destructive", description: res.error });
      }
    };

    emitter.on("objectDeleteRequested", handler);
    return () => emitter.off("objectDeleteRequested", handler);
  }, []);

  useEffect(() => {
    const handler = async ({
      id,
      source,
      target,
    }: {
      id: string;
      source: string;
      target: string;
    }) => {
      const res = await updateObject(target, { parentId: null });
      if (res.state === "success") {
        setData((prev) =>
          prev.map((obj) =>
            obj.id === target ? { ...obj, parentId: null } : obj
          )
        );
        toast({ description: "Połączenie usunięte" });
        emitter.emit("objectUpdated", res.data!);
      } else {
        toast({ variant: "destructive", description: res.error });
      }
    };

    emitter.on("edgeDeleteRequested", handler);
    return () => emitter.off("edgeDeleteRequested", handler);
  }, []);

  useEffect(() => {
    const handler = (updated: ObjectType) => {
      setData((prev) =>
        prev.map((obj) => (obj.id === updated.id ? updated : obj))
      );
    };

    emitter.on("objectUpdated", handler);
    return () => emitter.off("objectUpdated", handler);
  }, []);

  const onNodesChange: OnNodesChange = useCallback(() => {}, []);
  const onEdgesChange: OnEdgesChange = useCallback(() => {}, []);

  const onConnect = useCallback(async (connection: Connection) => {
    if (!connection.source || !connection.target) return;

    const res = await updateObject(connection.target, {
      parentId: connection.source,
    });

    if (res.state === "success") {
      setData((prev) =>
        prev.map((obj) =>
          obj.id === connection.target
            ? { ...obj, parentId: connection.source as string }
            : obj
        )
      );
      toast({ description: "Połączenie utworzone" });
    } else {
      toast({ variant: "destructive", description: res.error });
    }
  }, []);

  const isDialogOpen = dialogParent !== null || editObject !== null;

  return (
    <>
      {showAddRootButton && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCreateRoot(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Dodaj pierwszy węzeł
            </Button>
          </div>
        </div>
      )}
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background />
          <Controls className="!bg-card !text-foreground !border !rounded-md" />
          <MiniMap
            style={{
              backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#f9fafb",
            }}
            nodeColor={() => (resolvedTheme === "dark" ? "#60a5fa" : "#3b82f6")}
            maskColor={
              resolvedTheme === "dark"
                ? "rgba(17,17,17,0.6)"
                : "rgba(255,255,255,0.6)"
            }
          />
        </ReactFlow>
      </div>

      <CreateObjectDialog
        parentId={createRoot ? undefined : dialogParent ?? undefined}
        parentLevel={
          createRoot
            ? -1
            : dialogParent
            ? data.find((obj) => obj.id === dialogParent)?.level ?? 0
            : undefined
        }
        object={editObject ?? undefined}
        open={isDialogOpen || createRoot}
        onOpenChange={(open) => {
          if (!open) {
            setDialogParent(null);
            setEditObject(null);
            setCreateRoot(false);
          }
        }}
      />
    </>
  );
}
