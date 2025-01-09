"use client";
import { useEffect, useState } from 'react';
import { databases } from '@/lib/conf';
import { DATABASE_ID, COLLECTION_ID, processNoteBlocks, PageData } from '@/lib/conf';

interface NoteDisplayProps {
  id: string;
  initialNote?: any;
}

export default function NoteDisplay({ id, initialNote }: NoteDisplayProps) {
  const [note, setNote] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(!initialNote);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
      setLoading(false);
      return;
    }

    const fetchNote = async () => {
      try {
        const response = await databases.getDocument(
          DATABASE_ID,
          COLLECTION_ID,
          id
        );

        if (!response.isPublic) {
          setError('This note is private');
          return;
        }

        const processedNote = await processNoteBlocks(response);
        setNote(processedNote);
      } catch (error) {
        console.error('Error fetching note:', error);
        setError('Note not found');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">{error}</h1>
          <p className="text-gray-600">Please check the URL and try again</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {note.category}
            </span>
            <span>
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap">{note.content}</div>

          {note.blocks?.map((block: any, index: number) => {
            if (block.type === 'paragraph') {
              return <p key={index} className="mb-4">{block.content}</p>;
            }
            if (block.type === 'image' && block.props?.url) {
              return (
                <img 
                  key={index}
                  src={block.props.url} 
                  alt={block.props.alt || 'Note image'} 
                  className="my-4 rounded-lg w-52"
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
} 