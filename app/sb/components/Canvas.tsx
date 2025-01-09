"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID, updatePage } from '@/lib/conf';
import { Query } from 'appwrite';
import NoteViewer from './NoteViewer';
import { useAuth } from '../../context/AuthContext';
import ReactFlow, { 
  Background, 
  Controls, 
  Connection,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  Handle,
  Position,
  ConnectionMode,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ID } from 'appwrite';
import { storage } from '@/lib/conf';
import { STORAGE_BUCKET_ID } from '@/lib/conf';
// import 
interface Note {
  $id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  blocksData?: string;
  connections?: string;
  position?: string;
}

const NoteNode = ({ data }: { data: Note & { onClick: () => void } }) => (
  <div 
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96 cursor-pointer hover:shadow-xl transition-shadow border-2 border-gray-200"
    onClick={(e) => {
      e.stopPropagation();
      data.onClick();
    }}
  >
    <Handle 
      type="source" 
      position={Position.Top} 
      className="!bg-blue-500 !w-3 !h-3" 
      isConnectable={true}
      id="top"
    />
    <Handle 
      type="source" 
      position={Position.Bottom} 
      className="!bg-blue-500 !w-3 !h-3" 
      isConnectable={true}
      id="bottom"
    />
    <Handle 
      type="source" 
      position={Position.Left} 
      className="!bg-blue-500 !w-3 !h-3" 
      isConnectable={true}
      id="left"
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      className="!bg-blue-500 !w-3 !h-3" 
      isConnectable={true}
      id="right"
    />
    <h3 className="font-semibold mb-3 truncate text-lg">{data.title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
      {data.content}
    </p>
    <div className="mt-3 text-xs text-blue-500">Click to view • Drag blue dots to connect</div>
  </div>
);

export default function Canvas() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryNoteCounts, setCategoryNoteCounts] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Memoize nodeTypes to prevent unnecessary re-renders
  const nodeTypes = useMemo(() => ({
    noteNode: NoteNode,
  }), []);

  // Memoize default edge options
  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#2563eb', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#2563eb',
      width: 20,
      height: 20
    },
  }), []);

  // Fetch categories and their note counts
  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      if (!user) return;
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
          ]
        );
        
        // Get unique categories and count notes for each
        const counts: Record<string, number> = {};
        response.documents.forEach(doc => {
          if (doc.category) {
            counts[doc.category] = (counts[doc.category] || 0) + 1;
          }
        });
        
        const uniqueCategories = Object.keys(counts).sort();
        setCategories(uniqueCategories);
        setCategoryNoteCounts(counts);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategoriesAndCounts();
  }, [user]);

  // Save connections before closing
  const handleClose = async () => {
    setIsSaving(true);
    try {
      // Find a note in this category to store connections
      const categoryNote = notes.find(note => note.category === selectedCategory);
      if (categoryNote) {
        const connectionsData = JSON.stringify(edges);
        // Store connections in a file if they exist
        if (edges.length > 0) {
          const blob = new Blob([connectionsData], { type: 'application/json' });
          const file = new File([blob], 'connections.json');
          const result = await storage.createFile(
            STORAGE_BUCKET_ID,
            ID.unique(),
            file
          );
          await updatePage(categoryNote.$id, {
            connections: result.$id
          });
        } else {
          // If no connections, clear the reference
          await updatePage(categoryNote.$id, {
            connections: ''
          });
        }
      }
    } catch (error) {
      console.error('Error saving connections:', error);
    } finally {
      setIsSaving(false);
      setSelectedCategory(null);
    }
  };

  // Load saved connections when opening category
  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedCategory || !user) return;

      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
            Query.equal('category', selectedCategory)
          ]
        );
        
        const typedNotes = response.documents.map(doc => ({
          $id: doc.$id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          userId: doc.userId,
          blocksData: doc.blocksData,
          connections: doc.connections,
          position: doc.position
        })) as Note[];
        
        setNotes(typedNotes);

        // Create nodes
        const radius = Math.max(300, typedNotes.length * 50);
        const angleStep = (2 * Math.PI) / typedNotes.length;
        
        const flowNodes = typedNotes.map((note, index) => {
          const angle = index * angleStep;
          let position;
          if (note.position) {
            try {
              position = JSON.parse(note.position);
            } catch (error) {
              position = {
                x: radius * Math.cos(angle) + 500,
                y: radius * Math.sin(angle) + 300
              };
            }
          } else {
            position = {
              x: radius * Math.cos(angle) + 500,
              y: radius * Math.sin(angle) + 300
            };
          }
          return {
            id: note.$id,
            type: 'noteNode',
            position,
            data: {
              ...note,
              onClick: () => setSelectedNote(note)
            },
            draggable: true,
            connectable: true,
          };
        });

        setNodes(flowNodes);

        // Load saved connections from any note in this category
        const noteWithConnections = typedNotes.find(note => note.connections);
        if (noteWithConnections?.connections) {
          try {
            const fileUrl = storage.getFileDownload(STORAGE_BUCKET_ID, noteWithConnections.connections);
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('Failed to fetch connections');
            const text = await response.text();
            const connectionsData = JSON.parse(text);
            if (Array.isArray(connectionsData)) {
              setEdges(connectionsData);
            } else {
              console.error('Invalid connections data format');
              setEdges([]);
            }
          } catch (error) {
            console.error('Error loading connections:', error);
            setEdges([]);
          }
        } else {
          setEdges([]);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, [selectedCategory, user, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#2563eb', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#2563eb',
        width: 20,
        height: 20
      },
    }, eds));
  }, [setEdges]);

  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: any) => {
      // Update nodes state
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
      );

      // Save position to database
      try {
        const noteToUpdate = notes.find(note => note.$id === node.id);
        if (noteToUpdate) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            node.id,
            { 
              position: JSON.stringify(node.position)
            }
          );
          console.log('Node position saved:', node.position);
        }
      } catch (error) {
        console.error('Error saving node position:', error);
      }
    },
    [setNodes, notes]
  );

  const handleNoteUpdate = (updatedNote: Note) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.$id === updatedNote.$id ? updatedNote : note
      )
    );
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Please log in to view your notes.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1
              ${selectedCategory === category 
                ? 'bg-blue-500 text-white' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{category}</h3>
                <p className="text-xs sm:text-sm opacity-75">
                  {categoryNoteCounts[category] || 0} notes
                </p>
              </div>
              <span className="text-xl sm:text-2xl">📝</span>
            </div>
          </button>
        ))}
      </div>

      {/* Notes Canvas Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-[98vw] h-[98vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-3xl font-bold">{selectedCategory}</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEdges([])}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg"
                >
                  Clear Connections
                </button>
                <button
                  onClick={handleClose}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-xl flex items-center gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-600 dark:border-gray-300 border-t-transparent rounded-full animate-spin" />
                      <span className="text-base">Saving...</span>
                    </>
                  ) : (
                    "✕"
                  )}
                </button>
              </div>
            </div>
            
            <div className="h-[calc(98vh-88px)]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onConnect={onConnect}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
                connectOnClick={false}
                connectionMode={ConnectionMode.Loose}
                deleteKeyCode={['Backspace', 'Delete']}
                className="touch-none"
              >
                <Background color="#aaa" gap={20} />
                <Controls />
                <MiniMap/>
              </ReactFlow>
            </div>
          </div>
        </div>
      )}

      {/* Note Viewer Modal */}
      {selectedNote && (
        <NoteViewer
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onUpdate={handleNoteUpdate}
        />
      )}
    </div>
  );
} 