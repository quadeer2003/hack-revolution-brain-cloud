"use client";
import { useEffect, useState } from 'react';
import { useAuth } from './../../context/AuthContext';
import { getNotes, updatePage, deleteNote, PageData } from '@/lib/conf';
import NoteViewer from './NoteViewer';

export default function PublishedNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<PageData | null>(null);

  useEffect(() => {
    const fetchPublishedNotes = async () => {
      if (!user) return;
      
      try {
        const allNotes = await getNotes(user.$id);
        const publishedNotes = allNotes.filter(note => note.isPublic);
        setNotes(publishedNotes);
      } catch (error) {
        console.error('Error fetching published notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedNotes();
  }, [user]);

  const handleUnpublish = async (noteId: string) => {
    if (!confirm('Are you sure you want to unpublish this note?')) {
      return;
    }

    try {
      await updatePage(noteId, { isPublic: false });
      setNotes(notes.filter(note => note.$id !== noteId));
    } catch (error) {
      console.error('Error unpublishing note:', error);
      alert('Failed to unpublish note');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Published Notes</h1>
      
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No published notes yet
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.$id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <h2 
                  className="text-lg font-semibold cursor-pointer hover:text-blue-500"
                  onClick={() => setSelectedNote(note)}
                >
                  {note.title}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {note.category}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/notes/${note.$id}`;
                    navigator.clipboard.writeText(url);
                    alert('Public URL copied to clipboard!');
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => handleUnpublish(note.$id)}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-full text-sm flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
                    <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Unpublish
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedNote && (
        <NoteViewer 
          note={selectedNote} 
          onClose={() => setSelectedNote(null)} 
        />
      )}
    </div>
  );
} 