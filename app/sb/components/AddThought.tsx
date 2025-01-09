"use client";
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, lightDefaultTheme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useBlockNote } from "@blocknote/react";
import { useState } from "react";
import { useAuth } from "./../../context/AuthContext";
import { uploadFile, savePage } from "@/lib/conf";

export default function AddThought() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const editor = useBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "Start writing your thought here...",
      },
    ],
    uploadFile: async (file) => {
      try {
        const imageUrl = await uploadFile(file);
        return imageUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        return '';
      }
    },
  });

  const handleSave = async () => {
    if (!user || !title || !category) return;
    
    setIsSaving(true);
    setError("");
    
    try {
      const content = await editor.blocksToMarkdownLossy(editor.topLevelBlocks);
      const cleanBlocks = JSON.parse(JSON.stringify(editor.topLevelBlocks));
      
      const noteData = {
        title,
        category,
        content,
        blocks: cleanBlocks,
        isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await savePage(user.$id, noteData);

      // Reset form
      setTitle("");
      setCategory("");
      setIsPublic(false);
      editor.replaceBlocks(editor.topLevelBlocks, [
        {
          type: "paragraph",
          content: "Start writing your thought here...",
        },
      ]);
    } catch (error: any) {
      console.error("Error saving thought:", error);
      setError(error.message || "Failed to save thought");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!user) return;
    try {
      const content = await editor.blocksToMarkdownLossy(editor.topLevelBlocks);
      // In a real app, you would create a public share link through Appwrite
      const mockShareableLink = `${window.location.origin}/shared/${Math.random().toString(36).substr(2, 9)}`;
      setShareableLink(mockShareableLink);
    } catch (error) {
      console.error("Error publishing:", error);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">Add New Thought</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                   dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                   dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <div className="h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg">
          <BlockNoteView 
            editor={editor}
            theme={lightDefaultTheme}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            Make Public
          </label>
          
          <button
            onClick={handleSave}
            disabled={isSaving || !title || !category}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Publish
          </button>
        </div>

        {shareableLink && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="font-medium">Shareable Link:</p>
            <code className="block mt-2">{shareableLink}</code>
          </div>
        )}
      </div>
    </div>
  );
} 