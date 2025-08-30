import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ThoughtNode, { ThoughtNodeData } from './ThoughtNode';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const nodeTypes = {
  thoughtNode: ThoughtNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'thoughtNode',
    position: { x: 250, y: 100 },
    data: {
      id: '1',
      text: 'Welcome to your Thought Graph!\n\nDouble-click to edit this node or create new connections.',
    } as ThoughtNodeData,
  },
];

const initialEdges: Edge[] = [];

const ThoughtGraph: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(2);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: 'hsl(var(--connection))', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: 'hsl(var(--connection))',
      },
    }, eds)),
    [setEdges]
  );

  const createNewNode = useCallback((position?: { x: number; y: number }) => {
    const newNodeId = nodeIdCounter.toString();
    const newNode: Node = {
      id: newNodeId,
      type: 'thoughtNode',
      position: position || { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        id: newNodeId,
        text: '',
        isEditing: true,
      } as ThoughtNodeData,
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((counter) => counter + 1);
    
    return newNodeId;
  }, [nodeIdCounter, setNodes]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    const rect = (event.target as Element).getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    
    createNewNode(position);
  }, [createNewNode]);

  return (
    <div className="w-full h-full relative bg-gradient-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="w-full h-full bg-transparent"
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: 'hsl(var(--connection))', strokeWidth: 2 },
          markerEnd: {
            type: 'arrowclosed',
            color: 'hsl(var(--connection))',
          },
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="hsl(var(--node-border))"
          className="opacity-30"
        />
      </ReactFlow>
      
      {/* Floating Add Button */}
      <Button
        onClick={() => createNewNode()}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-primary"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ThoughtGraph;