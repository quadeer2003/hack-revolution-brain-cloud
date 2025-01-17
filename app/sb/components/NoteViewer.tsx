"use client";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView, lightDefaultTheme, darkDefaultTheme } from "@blocknote/mantine";
import { useBlockNote } from "@blocknote/react";
import { useState, useEffect } from "react";
import { uploadFile, updatePage, storage, STORAGE_BUCKET_ID, PageData } from "@/lib/conf";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X, Edit, Calendar, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/components/ui/use-toast";

interface NoteViewerProps {
  note: PageData;
  onClose: () => void;
  onUpdate?: (note: PageData) => void;
  nextNotes?: Array<{
    id: string;
    title: string;
    onClick: () => void;
  }>;
}

const DEFAULT_BLOCK: PartialBlock = {
  type: "paragraph",
  content: "Loading content..."
};

export default function NoteViewer({ note, onClose, onUpdate, nextNotes }: NoteViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [blocks, setBlocks] = useState<PartialBlock[]>([DEFAULT_BLOCK]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { theme: systemTheme } = useTheme();

  // Custom theme for BlockNote
  const customTheme = {
    ...(systemTheme === 'dark' ? darkDefaultTheme : lightDefaultTheme),
    componentStyles: {
      Editor: {
        backgroundColor: "transparent",
        padding: "1rem",
      },
      Paragraph: {
        fontSize: "1rem",
        lineHeight: "1.75",
      },
      Heading: {
        fontWeight: "600",
      },
      "Heading-1": {
        fontSize: "2rem",
        marginTop: "2rem",
        marginBottom: "1rem",
      },
      "Heading-2": {
        fontSize: "1.5rem",
        marginTop: "1.5rem",
        marginBottom: "0.75rem",
      },
      "Heading-3": {
        fontSize: "1.25rem",
        marginTop: "1.25rem",
        marginBottom: "0.5rem",
      },
      ListItem: {
        lineHeight: "1.75",
      },
      Image: {
        marginTop: "1rem",
        marginBottom: "1rem",
        borderRadius: "0.5rem",
      },
      Quote: {
        borderLeftWidth: "4px",
        paddingLeft: "1rem",
        fontStyle: "italic",
        marginLeft: "0",
        marginRight: "0",
        backgroundColor: systemTheme === 'dark' ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      },
    },
  } as any;

  const editor = useBlockNote({
    initialContent: [DEFAULT_BLOCK],
    uploadFile: async (file) => {
      try {
        const imageUrl = await uploadFile(file);
        return imageUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        return '';
      }
    },
    domAttributes: {
      editor: {
        class: "prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none"
      }
    }
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        if (note.blocksData) {
          const parsedBlocks: PartialBlock[] = JSON.parse(note.blocksData);
          
          // Process blocks to handle images and file content
          const processedBlocks = await Promise.all(parsedBlocks.map(async (block) => {
            // Handle image blocks
            if (block.type === 'image' && (block.props as any)?.fileId) {
              return {
                ...block,
                props: {
                  ...(block.props as any),
                  url: storage.getFileDownload(STORAGE_BUCKET_ID, (block.props as any).fileId)
                }
              };
            }
            // Handle content stored in files
            if (block.type === 'paragraph' && block.content === 'Content stored in file. Loading...') {
              const contentFileId = (block.props as any)?.fileId;
              if (contentFileId) {
                try {
                  const fileUrl = storage.getFileDownload(STORAGE_BUCKET_ID, contentFileId);
                  const response = await fetch(fileUrl);
                  if (!response.ok) {
                    throw new Error('Failed to fetch file content');
                  }
                  const content = await response.text();
                  console.log('Loaded content from file:', contentFileId, content.substring(0, 100) + '...');
                  return {
                    ...block,
                    content,
                    props: {
                      ...(block.props as any),
                      loadedFromFile: true
                    }
                  };
                } catch (error) {
                  console.error('Error loading file content:', error);
                  return {
                    ...block,
                    content: 'Error loading content: ' + (error as Error).message
                  };
                }
              }
            }
            return block;
          }));

          if (processedBlocks.length > 0) {
            console.log('Setting processed blocks:', processedBlocks);
            setBlocks(processedBlocks);
            editor.replaceBlocks(editor.topLevelBlocks, processedBlocks);
          }
        } else if (note.blocks?.length) {
          setBlocks(note.blocks);
          editor.replaceBlocks(editor.topLevelBlocks, note.blocks);
        } else if (note.content) {
          const contentBlock: PartialBlock[] = [{
            type: "paragraph",
            content: note.content
          }];
          setBlocks(contentBlock);
          editor.replaceBlocks(editor.topLevelBlocks, contentBlock);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        const errorBlock: PartialBlock[] = [{
          type: "paragraph",
          content: "Error loading content: " + (error as Error).message
        }];
        setBlocks(errorBlock);
        editor.replaceBlocks(editor.topLevelBlocks, errorBlock);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [note, editor]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedBlocks = editor.topLevelBlocks;
      const markdownContent = await editor.blocksToMarkdownLossy(updatedBlocks);
      await updatePage(note.$id, {
        title,
        content: markdownContent,
        blocksData: JSON.stringify(updatedBlocks)
      });
      setIsEditing(false);
      if (onUpdate) {
        onUpdate({
          ...note,
          title,
          content: markdownContent,
          blocksData: JSON.stringify(updatedBlocks)
        });
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (nextNotes && nextNotes.length > 0) {
      toast({
        title: "Connected Notes",
        description: (
          <div className="flex flex-col gap-2">
            <p>This note is connected to:</p>
            {nextNotes.map(nextNote => (
              <Button
                key={nextNote.id}
                variant="outline"
                size="sm"
                onClick={nextNote.onClick}
                className="justify-start"
              >
                {nextNote.title} →
              </Button>
            ))}
          </div>
        ),
        duration: 5000,
      });
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="sr-only">
            {note.title}
          </DialogTitle>
          <div className="flex flex-col gap-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-3xl font-bold">{note.title}</h2>
              <div className="flex items-center gap-4">
                {nextNotes && nextNotes.map(nextNote => (
                  <Button
                    key={nextNote.id}
                    variant="outline"
                    onClick={nextNote.onClick}
                    className="flex items-center gap-2"
                  >
                    {nextNote.title}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ))}
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px] p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-md">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
              <BlockNoteView 
                editor={editor} 
                theme={customTheme}
                editable={isEditing}
              />
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <div className="flex justify-end gap-2 w-full">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(note.title);
                    if (blocks) {
                      editor.replaceBlocks(editor.topLevelBlocks, blocks);
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 