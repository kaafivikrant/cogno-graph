import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Brain,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThoughtSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  selectedNodeId?: string | null;
  onCreateNode?: () => void;
}

const mockNodes = [
  { id: '1', title: 'Welcome to your Thought Graph!', preview: 'Double-click to edit this node...', connections: 0 },
  { id: '2', title: 'Project Ideas', preview: 'Brainstorming session for...', connections: 3 },
  { id: '3', title: 'Learning Goals', preview: 'Things I want to learn...', connections: 1 },
  { id: '4', title: 'Daily Reflections', preview: 'Today I realized that...', connections: 2 },
];

const ThoughtSidebar: React.FC<ThoughtSidebarProps> = ({
  isCollapsed = false,
  onToggle,
  selectedNodeId,
  onCreateNode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = mockNodes.filter(node =>
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={cn(
        "bg-sidebar-bg border-r border-sidebar-border shadow-sidebar transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-80"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Thought Graph</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!isCollapsed && (
          <div className="mt-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search thoughts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            
            <Button
              onClick={onCreateNode}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Thought
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isCollapsed ? (
          <div className="p-2 space-y-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateNode}
              className="w-full h-12"
              title="New Thought"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Separator />
            <div className="space-y-1">
              {mockNodes.slice(0, 4).map((node) => (
                <Button
                  key={node.id}
                  variant={selectedNodeId === node.id ? "secondary" : "ghost"}
                  size="icon"
                  className="w-full h-12"
                  title={node.title}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{mockNodes.length}</p>
                      <p className="text-xs text-muted-foreground">Thoughts</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {mockNodes.reduce((sum, node) => sum + node.connections, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Connections</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Node List */}
            <div className="flex-1">
              <div className="p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Recent Thoughts
                </h3>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="px-4 pb-4 space-y-2">
                  {filteredNodes.map((node) => (
                    <Card
                      key={node.id}
                      className={cn(
                        "p-3 cursor-pointer transition-all duration-200 hover:shadow-md border",
                        selectedNodeId === node.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <CardContent className="p-0">
                        <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                          {node.title || 'Untitled Thought'}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {node.preview}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{node.connections} connections</span>
                          <Network className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThoughtSidebar;