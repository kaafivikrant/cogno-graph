import React, { useState } from 'react';
import ThoughtGraph from '@/components/ThoughtGraph';
import ThoughtSidebar from '@/components/ThoughtSidebar';

const Index = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const handleCreateNode = () => {
    // This will be implemented to create a new node
    console.log('Creating new node...');
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <ThoughtSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
        selectedNodeId={selectedNodeId}
        onCreateNode={handleCreateNode}
      />
      <ThoughtGraph onNodeSelect={handleNodeSelect} />
    </div>
  );
};

export default Index;
