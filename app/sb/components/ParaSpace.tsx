"use client";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

interface Note {
  id: string;
  title: string;
  category: "projects" | "areas" | "resources" | "archives";
}

export default function ParaSpace() {
  const [notes, setNotes] = useState<Note[]>([
    { id: "1", title: "Learn Next.js", category: "projects" },
    { id: "2", title: "Write Blog Post", category: "areas" },
    // Add more mock notes
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">PARA Space</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {["projects", "areas", "resources", "archives"].map((category) => (
          <div
            key={category}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h2 className="text-lg font-semibold mb-4 capitalize">{category}</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={notes.filter((note) => note.category === category)}
                strategy={verticalListSortingStrategy}
              >
                {notes
                  .filter((note) => note.category === category)
                  .map((note) => (
                    <SortableItem key={note.id} id={note.id}>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
                        {note.title}
                      </div>
                    </SortableItem>
                  ))}
              </SortableContext>
            </DndContext>
          </div>
        ))}
      </div>
    </div>
  );
} 