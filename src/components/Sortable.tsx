"use client";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

const lockToVertical: Modifier = ({ transform }) => ({ ...transform, x: 0 });

export function SortableList({
  id,
  ids,
  onMove,
  layout = "vertical",
  children,
}: {
  id: string;
  ids: string[];
  onMove: (fromId: string, toId: string) => void;
  layout?: "vertical" | "grid";
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // A short press starts a drag on touch screens; a quick swipe still scrolls.
    useSensor(TouchSensor, { activationConstraint: { delay: layout === "grid" ? 220 : 90, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={layout === "vertical" ? [lockToVertical] : undefined}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={layout === "vertical" ? verticalListSortingStrategy : rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export interface SortableRenderProps {
  /** Spread onto the element that starts a drag (a handle, or the whole chip). */
  handleProps: HTMLAttributes<HTMLElement>;
  isDragging: boolean;
}

export function SortableItem({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: (p: SortableRenderProps) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children({ handleProps: { ...attributes, ...listeners }, isDragging })}
    </div>
  );
}
