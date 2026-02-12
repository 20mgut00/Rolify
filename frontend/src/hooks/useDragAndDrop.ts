import { useState } from "react";

interface UseDragAndDropProps {
  onDrop: (file: File) => void;
}

export function useDragAndDrop({ onDrop }: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (
    e: React.DragEvent,
    type: "over" | "enter" | "leave" | "drop"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (type === "enter") setIsDragging(true);
    else if (type === "leave" || type === "drop") setIsDragging(false);

    if (type === "drop") {
      const file = e.dataTransfer.files?.[0];
      if (file) onDrop(file);
    }
  };

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => handleDrag(e, "over"),
    onDragEnter: (e: React.DragEvent) => handleDrag(e, "enter"),
    onDragLeave: (e: React.DragEvent) => handleDrag(e, "leave"),
    onDrop: (e: React.DragEvent) => handleDrag(e, "drop"),
  };

  return { isDragging, dragHandlers };
}
