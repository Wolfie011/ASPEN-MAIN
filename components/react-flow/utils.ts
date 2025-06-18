import dagre from "dagre";
import { Node } from "reactflow";
import { ObjectType } from "@/types/object/types";

export function createNodes(
  objs: ObjectType[],
  onAddChild: (id: string) => void,
): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 100 });

  const nodeWidth = 180;
  const nodeHeight = 70;

  // Dodaj węzły do grafu
  objs.forEach((obj) => {
    g.setNode(obj.id, { width: nodeWidth, height: nodeHeight });
  });

  // Dodaj krawędzie (relacje parent -> child)
  objs.forEach((obj) => {
    if (obj.parentId) {
      g.setEdge(obj.parentId, obj.id);
    }
  });

  // Oblicz układ grafu
  dagre.layout(g);

  // Utwórz węzły React Flow na podstawie pozycji z dagre
  const nodes: Node[] = objs.map((obj) => {
    const dagreNode = g.node(obj.id);
    return {
      id: obj.id,
      type: "organizationNode",
      position: {
        x: dagreNode.x - nodeWidth / 2,
        y: dagreNode.y - nodeHeight / 2,
      },
      data: {
        id: obj.id,
        label: obj.name,
        description: obj.description,
        level: obj.level,
        type: obj.type,
        onAddChild,
      },
      draggable: true,
    };
  });

  return nodes;
}
