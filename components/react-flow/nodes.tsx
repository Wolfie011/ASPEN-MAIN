import { memo, MouseEvent } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { Plus, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import emitter from "@/lib/eventBus";

// 📦 Dane przekazywane do node'a
type OrgNodeData = {
  id: string;
  label: string;
  description?: string;
  level: number;
  type: string;
  onAddChild?: (parentId: string) => void;
};

// ✅ Główny komponent node'a
export const OrgNode = memo(function OrgNode({ id, data }: NodeProps<OrgNodeData>) {
  const handleAdd = (e: MouseEvent) => {
    e.stopPropagation();
    data.onAddChild?.(id);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    emitter.emit("objectDeleteRequested", id);
  };

  const handleEdit = () => {
    emitter.emit("objectEditRequested", id);
  };

  return (
<div className="relative w-48 rounded-md border bg-card px-4 py-2 text-center shadow-sm text-foreground">
      {/* 📝 Nazwa z tooltipem */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleEdit}
className="cursor-pointer text-sm font-medium"
          >
            {data.label}
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-left text-xs leading-5">
          <div><strong>Nazwa:</strong> {data.label}</div>
          <div><strong>Opis:</strong> {data.description || "Brak opisu"}</div>
          <div><strong>Poziom:</strong> {data.level}</div>
          <div><strong>Typ:</strong> {data.type}</div>
          <div><strong>ID:</strong> {data.id || "ERR"}</div>
        </TooltipContent>
      </Tooltip>

      {/* 🔌 Wejścia i wyjścia */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* ➕ Dodawanie dziecka */}
      <button
        onClick={handleAdd}
        title="Dodaj dziecko"
        className="absolute -right-3 -bottom-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700"
      >
        <Plus size={14} />
      </button>

      {/* 🗑️ Usuwanie */}
      <button
        onClick={handleDelete}
        title="Usuń"
        className="absolute -left-3 -bottom-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
      >
        <Trash size={14} />
      </button>
    </div>
  );
});

// 🔧 Eksport typów node’ów dla React Flow
export const nodeTypes = {
  organizationNode: OrgNode,
};
