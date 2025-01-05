"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { databases, storage, DATABASE_ID, COLLECTION_ID, STORAGE_BUCKET_ID, PageData, updatePage } from '@/lib/conf';
import { Query } from 'appwrite';
import { useAuth } from './../../context/AuthContext';
import NoteViewer from './NoteViewer';
import { enhanceSearch, summarizeContent, generateTags } from '@/lib/gemini';
import { Badge } from "@/components/ui/badge";
import ChatPopup from './ChatPopup';
import { Button } from "@/components/ui/button";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface SuggestionPosition {
  top: number;
  left: number;
}

export default function SmartSearch() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allNotes, setAllNotes] = useState<PageData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<PageData[]>([]);
  const [mentionedNote, setMentionedNote] = useState<PageData | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showChat, setShowChat] = useState(false);

  // Fetch all notes for suggestions
  useEffect(() => {
    const fetchAllNotes = async () => {
      if (!user) return;
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
            Query.limit(100)
          ]
        );
        
        // Process each note to ensure we have content and tags
        const notes = response.documents.map(doc => ({
          ...doc,
          content: doc.content || doc.blocksData || '',
          tags: doc.tags || '[]'  // Ensure tags is at least an empty array string
        })) as PageData[];
        
        setAllNotes(notes);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
    fetchAllNotes();
  }, [user]);

  const getFileContent = async (fileId: string): Promise<string> => {
    try {
      const response = await fetch(storage.getFileDownload(STORAGE_BUCKET_ID, fileId));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      return text;
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Handle @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const searchAfterAt = value.slice(lastAtIndex + 1).toLowerCase();
      
      // Filter notes based on title, content, or tags
      const filtered = allNotes.filter(note => {
        // Check title
        const titleMatch = note.title.toLowerCase().includes(searchAfterAt);
        
        // Check tags if they exist
        let tagMatch = false;
        if (note.tags) {
          try {
            const noteTags = JSON.parse(note.tags);
            tagMatch = noteTags.some((tag: string) => 
              tag.toLowerCase().includes(searchAfterAt)
            );
          } catch (error) {
            console.error('Error parsing tags:', error);
          }
        }

        return titleMatch || tagMatch;
      });

      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (note: PageData) => {
    try {
      console.log('Loading note:', note.title);
      const fullNote = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID,
        note.$id
      ) as PageData;
      
      // Parse metadata from metadataStr if it exists
      const metadata = fullNote.metadataStr ? JSON.parse(fullNote.metadataStr) : null;
      console.log('Parsed metadata:', metadata);

      // Update the note with parsed metadata
      const noteWithMetadata = {
        ...fullNote,
        metadata: metadata
      };
      
      console.log('Full note with metadata:', noteWithMetadata);
      let noteContent = '';

      // First check blocksData for file content
      if (fullNote.blocksData) {
        try {
          console.log('Parsing blocksData:', fullNote.blocksData);
          const blocks = JSON.parse(fullNote.blocksData);
          const contentParts: string[] = [];

          for (const block of blocks) {
            console.log('Processing block:', block);
            
            // Check for fileId in any block type
            const fileId = block.props?.fileId || block.props?.id || block.fileId || block.id;
            if (fileId) {
              console.log('Found fileId:', fileId);
              try {
                const fileContent = await getFileContent(fileId);
                if (fileContent) {
                  contentParts.push(fileContent);
                }
              } catch (error) {
                console.error('Error loading file content:', error);
                contentParts.push('[Error: Could not load file content]');
              }
            }
            // If no fileId and block has content, use that
            else if (block.type === 'paragraph' || block.type === 'text') {
              contentParts.push(block.props?.text || block.content || '');
            }
          }

          noteContent = contentParts.filter(Boolean).join('\n\n');
          console.log('Content assembled from blocks, length:', noteContent.length);
        } catch (error) {
          console.error('Error parsing blocksData:', error);
        }
      }
      // Fallback to content if no file content found
      else if (fullNote.content) {
        noteContent = fullNote.content;
        console.log('Using note content directly');
      }

      // Update the note with the complete content
      if (!noteContent) {
        noteContent = 'No content available';
      }
      noteWithMetadata.content = noteContent;
      console.log('Final note content:', {
        length: noteContent.length,
        preview: noteContent.substring(0, 100)
      });
      
      setMentionedNote(noteWithMetadata);
      setShowSuggestions(false);
      setSearchQuery(`@${note.title}`);
    } catch (error) {
      console.error('Error fetching full note:', error);
      alert('Failed to load note content. Please try again.');
    }
  };

  const generateSummary = async () => {
    if (!mentionedNote) return;
    
    let contentToSummarize = mentionedNote.content;
    console.log('Content to summarize length:', contentToSummarize?.length);
    
    // If there's no content, try to get it from blocksData
    if (!contentToSummarize && mentionedNote.blocksData) {
      try {
        console.log('Parsing blocksData for summary');
        const blocks = JSON.parse(mentionedNote.blocksData);
        const contentParts: string[] = [];

        // Process each block
        for (const block of blocks) {
          if (block.type === 'paragraph' || block.type === 'text') {
            contentParts.push(block.props?.text || block.content || '');
          }
          // If it's a file block, fetch its content
          else if (block.type === 'file' && block.props?.fileId) {
            console.log('Found file block for summary, fileId:', block.props.fileId);
            try {
              const fileContent = await getFileContent(block.props.fileId);
              contentParts.push(fileContent);
            } catch (error) {
              console.error('Error loading file content for summary:', error);
              contentParts.push('[Error: Could not load file content]');
            }
          }
        }

        contentToSummarize = contentParts.filter(Boolean).join('\n');
        console.log('Content assembled for summary, length:', contentToSummarize.length);
      } catch (error) {
        console.error('Error processing blocksData for summary:', error);
      }
    }
    
    if (!contentToSummarize) {
      alert('Note content is not accessible. Please try again later.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Generate summary
      console.log('Generating summary for content length:', contentToSummarize.length);
      const summary = await summarizeContent(contentToSummarize);
      if (!summary) {
        throw new Error('Failed to generate summary');
      }
      console.log('Summary generated, length:', summary.length);
      setSummary(summary);

      // Generate and save tags
      const tags = await generateTags(contentToSummarize);
      console.log('Generated tags:', tags);

      if (tags.length > 0) {
        try {
          // Update the document in Appwrite
          const updatedNote = await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            mentionedNote.$id,
            {
              tags: JSON.stringify(tags)
            }
          );
          console.log('Tags saved successfully:', updatedNote);

          // Update local state
          setMentionedNote(prev => prev ? {
            ...prev,
            tags: JSON.stringify(tags)
          } : null);
        } catch (error) {
          console.error('Error saving tags to database:', error);
          throw error;
        }
      }

    } catch (error) {
      console.error('Error in summary/tags generation:', error);
      alert('Failed to generate summary and tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Image
          src="/brain_cloud-removebg-preview.png"
          width={100}
          height={100}
          alt="logo"
          priority
        />
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Type @ to mention a note"
            className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
              {filteredSuggestions.map((note) => (
                <button
                  key={note.$id}
                  onClick={() => handleSuggestionClick(note)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer block"
                >
                  <div className="font-medium">{note.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{note.category}</div>
                  {note.tags && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {JSON.parse(note.tags).map((tag: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className={`text-xs ${
                            searchQuery.slice(1).toLowerCase() && 
                            tag.toLowerCase().includes(searchQuery.slice(1).toLowerCase())
                              ? 'bg-blue-100 dark:bg-blue-900'
                              : ''
                          }`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mentioned Note */}
      {mentionedNote && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">{mentionedNote.title}</h3>
          {mentionedNote.category && (
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {mentionedNote.category}
              </span>
            </div>
          )}
          
          {/* Preview of note content */}
          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">Content Preview:</h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-gray-600 dark:text-gray-300">
              {mentionedNote.content === 'No content available' ? (
                <p className="italic text-gray-500">No content available</p>
              ) : mentionedNote.content.includes('File Content:') ? (
                <div>
                  <p className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                    File content loaded successfully
                  </p>
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-100 dark:bg-gray-600 p-2 rounded">
                    {mentionedNote.content.substring(0, 500)}
                    {mentionedNote.content.length > 500 && '...'}
                  </pre>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">
                  {mentionedNote.content.substring(0, 500)}
                  {mentionedNote.content.length > 500 && '...'}
                </p>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span>Generating summary...</span>
            </div>
          ) : summary ? (
            <div className="prose dark:prose-invert max-w-none">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-medium">Summary:</h4>
                <Button
                  onClick={() => setShowChat(true)}
                  variant="outline"
                  size="sm"
                  className="ml-2"
                >
                  Chat about this
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-300">{summary}</p>
              </div>
            </div>
          ) : (
            <div>
              {mentionedNote.content !== 'No content available' && (
                <button
                  onClick={generateSummary}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Generate Summary
                </button>
              )}
            </div>
          )}

          {summary && mentionedNote?.metadata?.image && (
            console.log('Rendering image with metadata:', mentionedNote.metadata),
            <div className="mt-4">
              <h4 className="text-lg font-medium mb-2">Preview Image:</h4>
              <div className="relative w-full aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Loading placeholder */}
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full" />
                </div>
                <img
                  src={mentionedNote.metadata.image}
                  alt={mentionedNote.title}
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
            </div>
          )}

          {summary && mentionedNote?.tags && (
            <div className="mt-4">
              <h4 className="text-lg font-medium mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {JSON.parse(mentionedNote.tags).map((tag: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-sm"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Chat Popup */}
      {showChat && (
        <ChatPopup
          content={mentionedNote?.content || ''}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
} 