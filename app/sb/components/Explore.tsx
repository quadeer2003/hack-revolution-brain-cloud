"use client";
import { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID, PageData, deleteNote, updatePage, storage, STORAGE_BUCKET_ID } from '@/lib/conf';
import { Query, ID } from 'appwrite';
import { useAuth } from './../../context/AuthContext';
import NoteViewer from './NoteViewer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Trash2, Link } from "lucide-react";

export default function Explore() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<PageData[]>([]);
  const [selectedNote, setSelectedNote] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [updatingNoteId, setUpdatingNoteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
            Query.orderDesc('$createdAt')
          ]
        );
        const notesWithMetadata = response.documents.map(doc => ({
          ...doc,
          metadata: doc.metadataStr ? JSON.parse(doc.metadataStr) : null
        }));
        setNotes(notesWithMetadata as PageData[]);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  const handleDelete = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingNoteId(noteId);
      await deleteNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.$id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleTogglePublic = async (note: PageData, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      setUpdatingNoteId(note.$id);
      
      // If making the note public and content is stored in a file
      let updatedContent = note.content;
      let updatedBlocksData = note.blocksData;
      
      if (!note.isPublic && note.blocksData) {
        try {
          const blocks = JSON.parse(note.blocksData);
          // Process blocks to load content from files
          const processedBlocks = await Promise.all(blocks.map(async (block: any) => {
            if (block.type === 'paragraph' && block.content === 'Content stored in file. Loading...') {
              const contentFileId = block.props?.fileId;
              if (contentFileId) {
                try {
                  const fileUrl = storage.getFileDownload(STORAGE_BUCKET_ID, contentFileId);
                  const response = await fetch(fileUrl);
                  if (!response.ok) {
                    throw new Error(`Failed to fetch file content: ${response.statusText}`);
                  }
                  const content = await response.text();
                  console.log('Fetched content from file:', content.substring(0, 100) + '...');
                  return {
                    ...block,
                    content: content,
                    props: {
                      ...block.props,
                      loadedFromFile: true
                    }
                  };
                } catch (error) {
                  console.error('Error loading file content:', error);
                  return block;
                }
              }
            }
            return block;
          }));

          // Extract text content from processed blocks
          const contentParts = processedBlocks
            .map((block: any) => {
              if (block.type === 'paragraph') {
                return block.content !== 'Content stored in file. Loading...' ? block.content : '';
              }
              return '';
            })
            .filter(Boolean);

          const fullContent = contentParts.join('\n\n');
          console.log('Full content length:', fullContent.length);

          // If content is too long, store it in a file
          if (fullContent.length > 700) {
            const blob = new Blob([fullContent], { type: 'text/plain' });
            const file = new File([blob], 'content.txt');
            const result = await storage.createFile(STORAGE_BUCKET_ID, ID.unique(), file);
            
            updatedContent = 'Content stored in file. Loading...';
            updatedBlocksData = JSON.stringify([{
              type: 'paragraph',
              content: 'Content stored in file. Loading...',
              props: {
                fileId: result.$id
              }
            }]);
          } else {
            updatedContent = fullContent;
            updatedBlocksData = JSON.stringify(processedBlocks);
          }
        } catch (error) {
          console.error('Error processing blocks:', error);
        }
      }

      console.log('Updating note with new content...');
      const updatedNote = await updatePage(note.$id, {
        isPublic: !note.isPublic,
        content: updatedContent,
        blocksData: updatedBlocksData
      });

      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.$id === note.$id ? {
            ...n,
            isPublic: !note.isPublic,
            content: updatedContent,
            blocksData: updatedBlocksData
          } : n
        )
      );
    } catch (error) {
      console.error('Error updating note visibility:', error);
      alert('Failed to update note visibility. Please try again.');
    } finally {
      setUpdatingNoteId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-2 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Explore Your Web Clips</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-xl font-bold mb-4 sm:mb-6">Explore Your Clips</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {notes.map((note) => (
          <Card 
            key={note.$id}
            className="group relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer w-full mx-auto max-w-sm"
            onClick={() => setSelectedNote(note)}
          >
            {/* Action Buttons */}
            <div className="absolute top-1 right-1 flex gap-1 z-10">
              {note.metadata?.url && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(note.metadata.url, '_blank');
                  }}
                >
                  <Link className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleTogglePublic(note, e)}
                disabled={updatingNoteId === note.$id}
              >
                {updatingNoteId === note.$id ? (
                  <div className="w-3 h-3 border-2 border-gray-600 dark:border-gray-300 border-t-transparent rounded-full animate-spin" />
                ) : note.isPublic ? (
                  <span className="text-xs">🌍</span>
                ) : (
                  <span className="text-xs">🔒</span>
                )}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDelete(note.$id, e)}
                disabled={deletingNoteId === note.$id}
              >
                {deletingNoteId === note.$id ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* OG Image */}
            {note.metadata?.image && (
              <div className="relative w-full aspect-[16/9] bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Loading placeholder */}
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full" />
                </div>
                <img
                  src={note.metadata.image}
                  alt={note.title}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.parentElement?.classList.add('hidden');
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                  }}
                  style={{ opacity: 0 }}
                />
              </div>
            )}
            
            <CardHeader className="p-2 sm:p-4">
              <CardTitle className="text-sm line-clamp-2">{note.title}</CardTitle>
              {note.metadata?.description && (
                <CardDescription className="text-xs line-clamp-2">
                  {note.metadata.description}
                </CardDescription>
              )}
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {note.content && note.content !== 'Content stored in file. Loading...' ? (
                  note.content
                ) : note.blocksData ? (
                  JSON.parse(note.blocksData).map((block: any) => 
                    block.type === 'paragraph' ? block.content : ''
                  ).join(' ')
                ) : (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-3 w-3/4 rounded" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
              {/* Source Info */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {note.metadata?.siteName && (
                      <span className="mr-2">{note.metadata.siteName}</span>
                    )}
                    {note.metadata?.publishedTime && (
                      <span>
                        {new Date(note.metadata.publishedTime).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Source Information</h4>
                    {note.metadata?.url && (
                      <p className="text-xs text-muted-foreground break-all">
                        {note.metadata.url}
                      </p>
                    )}
                    {note.metadata?.author && (
                      <p className="text-xs">Author: {note.metadata.author}</p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </CardContent>
            
            <CardFooter className="p-2 sm:p-4 pt-0 sm:pt-0">
              {/* Category Tag */}
              {note.category && (
                <Badge variant="secondary" className="text-xs">
                  {note.category}
                </Badge>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Note Viewer Modal */}
      {selectedNote && (
        <NoteViewer
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onUpdate={(updatedNote) => {
            setNotes(prevNotes =>
              prevNotes.map(note =>
                note.$id === updatedNote.$id ? updatedNote : note
              )
            );
          }}
        />
      )}
    </div>
  );
} 