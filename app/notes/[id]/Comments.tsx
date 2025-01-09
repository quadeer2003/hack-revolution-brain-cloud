"use client";

import React, { useEffect } from "react";
import { useThreads } from "@liveblocks/react/suspense";
import { Composer, Thread } from "@liveblocks/react-ui";
import { Room } from "./Room";
import { MessageCircle } from "lucide-react";

function CommentsSection() {
  const { threads } = useThreads();

  useEffect(() => {
    console.log("CommentsSection mounted");
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Discussion</h2>
        {threads.length > 0 && (
          <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full">
            {threads.length}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {threads.length === 0 ? (
          <div className="text-center py-12 px-6 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start the Discussion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              Be the first to share your thoughts on this note. Your insights could help others!
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {threads.length} comment{threads.length !== 1 ? 's' : ''} in this discussion
            </div>
            <div className="space-y-4">
              {threads.map((thread) => (
                <Thread 
                  key={thread.id} 
                  thread={thread} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                />
              ))}
            </div>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Add to the discussion
          </div>
          <Composer 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors" 
            onComposerSubmit={() => {
              console.log("Comment submitted");
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface CommentsProps {
  noteId: string;
}

export default function Comments({ noteId }: CommentsProps) {
  useEffect(() => {
    console.log("Comments component mounted with noteId:", noteId);
  }, [noteId]);

  return (
    <div className="comments-section w-full">
      <Room roomId={`note-comments-${noteId}`}>
        <CommentsSection />
      </Room>
    </div>
  );
} 