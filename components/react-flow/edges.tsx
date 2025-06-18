"use client";

import { Edge } from "reactflow";
import CustomEdge from "./CustomEdge";

// Typy krawędzi dostępne w aplikacji
export const edgeTypes = {
  custom: CustomEdge,
};

// Tworzy krawędzie na podstawie relacji parentId w obiektach
export function createEdges(objects: { id: string; parentId: string | null }[]): Edge[] {
  return objects
    .filter((o) => o.parentId)
    .map((o) => ({
      id: `e-${o.parentId}-${o.id}`,
      source: o.parentId!,
      target: o.id,
      type: "custom",
    }));
}
