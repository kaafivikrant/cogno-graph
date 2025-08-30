import React, { useCallback, useState, useRef, useLayoutEffect, useEffect } from 'react';
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
  getEdgeCenter,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ThoughtNode, { ThoughtNodeData } from './ThoughtNode';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'cogno-graph-flow';

const nodeTypes = {
  thoughtNode: (props: any) => (
    <ThoughtNode
      {...props}
      onTextChange={props.data.onTextChange}
    />
  ),
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'thoughtNode',
    position: { x: 250, y: 100 },
    data: {
      id: '1',
      text: 'New Note',
    } as ThoughtNodeData,
  },
];

const initialEdges: Edge[] = [];

const ThoughtGraph: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(2);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [edgeButtonPos, setEdgeButtonPos] = useState<{ x: number; y: number } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

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

  // Handle edge click to select it and compute button position
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setSelectedEdge(edge);

      // Find source and target node positions
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode || !reactFlowInstance) {
        setEdgeButtonPos(null);
        return;
      }
      // Get edge center in flow coordinates
      const [centerX, centerY] = getEdgeCenter({
        sourceX: sourceNode.position.x + (sourceNode.width ?? 0) / 2,
        sourceY: sourceNode.position.y + (sourceNode.height ?? 0) / 2,
        targetX: targetNode.position.x + (targetNode.width ?? 0) / 2,
        targetY: targetNode.position.y + (targetNode.height ?? 0) / 2,
      });
      // Convert to screen coordinates
      // const point = reactFlowInstance.project({ x: centerX, y: centerY });
      const { x: tx, y: ty, zoom } = reactFlowInstance.getViewport();
      const point = {
        x: centerX * zoom + tx,
        y: centerY * zoom + ty,
      };
      setEdgeButtonPos({ x: point.x, y: point.y });
    },
    [nodes, reactFlowInstance]
  );

  // Remove selected edge
  const handleDeleteEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      setEdgeButtonPos(null);
    }
  }, [selectedEdge, setEdges]);

  // Deselect edge when clicking on pane
  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
    setEdgeButtonPos(null);
  }, []);

  // Update button position if nodes move
  useLayoutEffect(() => {
    if (!selectedEdge || !reactFlowInstance) return;
    const sourceNode = nodes.find((n) => n.id === selectedEdge.source);
    const targetNode = nodes.find((n) => n.id === selectedEdge.target);
    if (!sourceNode || !targetNode) return;
    const [centerX, centerY] = getEdgeCenter({
      sourceX: sourceNode.position.x + (sourceNode.width ?? 0) / 2,
      sourceY: sourceNode.position.y + (sourceNode.height ?? 0) / 2,
      targetX: targetNode.position.x + (targetNode.width ?? 0) / 2,
      targetY: targetNode.position.y + (targetNode.height ?? 0) / 2,
    });
    // Use transform to convert flow coordinates to screen coordinates
    const { x: tx, y: ty, zoom } = reactFlowInstance.getViewport();
    const point = {
      x: centerX * zoom + tx,
      y: centerY * zoom + ty,
    };
    setEdgeButtonPos({ x: point.x, y: point.y });
  }, [selectedEdge, nodes, reactFlowInstance]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const { nodes: savedNodes, edges: savedEdges, nodeIdCounter: savedCounter } = JSON.parse(stored);
        if (Array.isArray(savedNodes) && Array.isArray(savedEdges)) {
          setNodes(savedNodes);
          setEdges(savedEdges);
          if (typeof savedCounter === 'number') setNodeIdCounter(savedCounter);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage on nodes/edges/counter change
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        nodes,
        edges,
        nodeIdCounter,
      })
    );
  }, [nodes, edges, nodeIdCounter]);

  // Update node text and persist
  const handleNodeTextChange = useCallback((id: string, text: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, text, isEditing: false } }
          : node
      )
    );
  }, [setNodes]);

  // Inject onTextChange into node data
  const nodesWithTextChange = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onTextChange: handleNodeTextChange,
    },
  }));

  return (
    <div className="w-full h-full relative bg-gradient-canvas" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodesWithTextChange}
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
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onInit={setReactFlowInstance}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="hsl(var(--node-border))"
          className="opacity-30"
        />
      </ReactFlow>
      {/* Floating Delete Edge Button */}
      {selectedEdge && edgeButtonPos && (
        <button
          style={{
            position: 'absolute',
            left: edgeButtonPos.x - 16,
            top: edgeButtonPos.y - 16,
            zIndex: 20,
            width: 32,
            height: 32,
            background: 'hsl(var(--destructive))',
            border: '2px solid hsl(var(--destructive))',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
          }}
          onClick={handleDeleteEdge}
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
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