import { memo } from "react";
import {
  getSmoothStepPath,
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
} from "reactflow";
import { X } from "lucide-react";
import emitter from "@/lib/eventBus";

function CustomEdge({ id, source, target, sourceX, sourceY, targetX, targetY }: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge path={edgePath} />
      <EdgeLabelRenderer>
        <div
          className="absolute translate-x-[-50%] translate-y-[-50%] z-50"
          style={{ left: labelX, top: labelY, pointerEvents: 'all' }}
        >
          <button
            onClick={() => {
              emitter.emit("edgeDeleteRequested", {id: id, target: target, source: source});
            }}
            className="rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600 transition-colors"
            title="Usuń połączenie"
          >
            <X size={14} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
