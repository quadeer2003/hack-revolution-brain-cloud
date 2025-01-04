import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  ConnectionMode,
  MarkerType,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { databases, DATABASE_ID, COLLECTION_ID } from '@/lib/conf';
import { Query } from 'appwrite';
import { useAuth } from './../../context/AuthContext';

interface Note {
  $id: string;
  title: string;
  content: string;
  category: string;
  $createdAt: string;
}

const ANIMATION_DELAY_PER_NODE = 0.5; // seconds per node animation

const NoteNode = ({ data }: { data: { label: string; isCategory?: boolean; index: number } }) => (
  <div className="relative group">
    <Handle
      type="target"
      position={Position.Top}
      style={{ background: '#3b82f6', width: 8, height: 8 }}
    />
    <Handle
      type="source"
      position={Position.Bottom}
      style={{ background: '#3b82f6', width: 8, height: 8 }}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.8,
        delay: data.index * ANIMATION_DELAY_PER_NODE,
        ease: "easeOut"
      }}
      className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center
        ${data.isCategory 
          ? 'bg-blue-500 border-2 border-blue-600' 
          : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'}`}
    />
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.5,
        delay: data.index * ANIMATION_DELAY_PER_NODE + 0.3
      }}
      className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm
        ${data.isCategory ? 'font-semibold' : 'font-normal'}`}
    >
      {data.label}
    </motion.div>
  </div>
);

export default function GraphView() {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEdges, setShowEdges] = useState(false);
  const initialized = useRef(false);
  const edgesData = useRef<Edge[]>([]);

  const nodeTypes = useMemo(() => ({
    noteNode: NoteNode,
  }), []);

  const defaultEdgeOptions = useMemo(() => ({
    type: 'straight',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
    },
  }), []);

  // Force simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    let animationFrameId: number;
    const simulation = {
      alpha: 1,
      nodes: nodes.map(node => ({ ...node, vx: 0, vy: 0 })),
      edges: edges,
    };

    const tick = () => {
      if (simulation.alpha < 0.01) return;

      // Apply forces
      simulation.nodes.forEach(node => {
        // Initialize velocities
        node.vx = 0;
        node.vy = 0;

        // Center force (very weak)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const dx = centerX - node.position.x;
        const dy = centerY - node.position.y;
        const centerDistance = Math.sqrt(dx * dx + dy * dy);
        if (centerDistance > 500) { // Only apply if too far from center
          node.vx += (dx / centerDistance) * 0.1;
          node.vy += (dy / centerDistance) * 0.1;
        }

        // Repulsion force between all nodes
        simulation.nodes.forEach(otherNode => {
          if (node.id !== otherNode.id) {
            const dx = otherNode.position.x - node.position.x;
            const dy = otherNode.position.y - node.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 200) { // Only apply repulsion when nodes are too close
              const repulsionForce = -1 / (distance * distance) * 1000;
              node.vx += (dx / distance) * repulsionForce;
              node.vy += (dy / distance) * repulsionForce;
            }
          }
        });

        // Edge forces (attraction)
        edges.forEach(edge => {
          if (edge.source === node.id || edge.target === node.id) {
            const other = simulation.nodes.find(n => 
              n.id === (edge.source === node.id ? edge.target : edge.source)
            );
            if (other) {
              const dx = other.position.x - node.position.x;
              const dy = other.position.y - node.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const targetDistance = 200; // Desired distance between connected nodes
              const force = (distance - targetDistance) * 0.03;
              node.vx += (dx / distance) * force;
              node.vy += (dy / distance) * force;
            }
          }
        });

        // Category-specific forces
        if (node.data.isCategory) {
          // Keep categories more spread out
          simulation.nodes.forEach(otherNode => {
            if (otherNode.data.isCategory && node.id !== otherNode.id) {
              const dx = otherNode.position.x - node.position.x;
              const dy = otherNode.position.y - node.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < 300) {
                const repulsionForce = -1 / (distance * distance) * 2000;
                node.vx += (dx / distance) * repulsionForce;
                node.vy += (dy / distance) * repulsionForce;
              }
            }
          });
        }

        // Apply velocity limits
        const maxVelocity = 5;
        const velocityMagnitude = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (velocityMagnitude > maxVelocity) {
          node.vx = (node.vx / velocityMagnitude) * maxVelocity;
          node.vy = (node.vy / velocityMagnitude) * maxVelocity;
        }

        // Update position
        node.position.x += node.vx;
        node.position.y += node.vy;
      });

      simulation.alpha *= 0.99;

      // Update nodes state
      setNodes(simulation.nodes.map(({ vx, vy, ...node }) => node));

      // Continue animation
      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes.length, edges, setNodes]);

  useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;
    setIsLoading(true);
    setShowEdges(false);

    const fetchNotes = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );

        const notes = response.documents as unknown as Note[];
        const sortedNotes = notes.sort(
          (a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
        );

        const categories = Array.from(new Set(sortedNotes.map(note => note.category)));
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Create category nodes
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = Math.max(200, categories.length * 50);
        const angleStep = (2 * Math.PI) / categories.length;

        // Add category nodes first
        categories.forEach((category, index) => {
          const angle = index * angleStep;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          const categoryId = `category-${category}`;
          newNodes.push({
            id: categoryId,
            type: 'noteNode',
            position: { x, y },
            data: { 
              label: category, 
              isCategory: true,
              index: index
            },
          });
        });

        // Add note nodes and create edges
        sortedNotes.forEach((note, index) => {
          const categoryIndex = categories.indexOf(note.category);
          const angle = categoryIndex * angleStep + (Math.random() - 0.5);
          const distance = radius * 0.6 * (1 + Math.random() * 0.2);
          
          const x = centerX + distance * Math.cos(angle);
          const y = centerY + distance * Math.sin(angle);

          const nodeId = note.$id;
          
          // Add note node
          newNodes.push({
            id: nodeId,
            type: 'noteNode',
            position: { x, y },
            data: { 
              label: note.title,
              index: categories.length + index
            },
          });

          // Create edge from note to category
          newEdges.push({
            id: `edge-${nodeId}`,
            source: nodeId,
            target: `category-${note.category}`,
            type: 'straight',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          });
        });

        // Store edges for later
        edgesData.current = newEdges;

        // Set nodes immediately
        setNodes(newNodes);
        setIsLoading(false);

        // Calculate total animation duration and set edges after all nodes are visible
        const totalNodes = newNodes.length;
        const lastNodeDelay = (totalNodes - 1) * ANIMATION_DELAY_PER_NODE;
        const lastNodeAnimationDuration = 0.8; // Same as the node animation duration
        const totalDelay = lastNodeDelay + lastNodeAnimationDuration + 0.5; // Add extra 0.5s buffer

        setTimeout(() => {
          setShowEdges(true);
          setEdges(newEdges);
        }, totalDelay * 1000);

      } catch (error) {
        console.error('Error fetching notes:', error);
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [user, setNodes, setEdges]);

  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
    );
  }, [setNodes]);

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner flex items-center justify-center">
        <div className="text-lg">Loading graph...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[80vh] bg-gray-50 dark:bg-gray-900 rounded-lg shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={showEdges ? edges : []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        className="touch-none"
        elementsSelectable={true}
        nodesConnectable={false}
        nodesDraggable={true}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
} 