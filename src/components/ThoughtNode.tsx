import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

export interface ThoughtNodeData extends Record<string, unknown> {
  id: string;
  text: string;
  isEditing?: boolean;
}

interface ThoughtNodeProps extends NodeProps {
  onTextChange?: (id: string, text: string) => void;
}

const ThoughtNode: React.FC<ThoughtNodeProps> = ({ data, selected, onTextChange }) => {
  const nodeData = data as ThoughtNodeData;
  const [isEditing, setIsEditing] = useState(nodeData.isEditing || false);
  const [text, setText] = useState(nodeData.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate node size based on text length
  const getNodeSize = useCallback((textContent: string) => {
    const baseWidth = 100; // reduced from 150
    const baseHeight = 50; // reduced from 80
    const charCount = textContent.length;
    
    // Dynamic sizing based on content
    const extraWidth = Math.min(charCount * 2, 200);
    const lines = textContent.split('\n').length;
    const extraHeight = Math.max(lines - 2, 0) * 20;
    
    return {
      width: Math.max(baseWidth + extraWidth, 100), // min 100
      height: Math.max(baseHeight + extraHeight, 50) // min 50
    };
  }, []);

  const nodeSize = getNodeSize(text);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleTextSubmit = useCallback(() => {
    setIsEditing(false);
    if (onTextChange && text !== nodeData.text) {
      onTextChange(nodeData.id, text);
    }
  }, [onTextChange, nodeData.id, text, nodeData.text]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setText(nodeData.text);
    }
  }, [handleTextSubmit, nodeData.text]);

  return (
    <div
      className={cn(
        "bg-gradient-node border border-node-border rounded-xl shadow-node transition-all duration-200",
        "hover:shadow-node-hover hover:border-node-active/30",
        selected && "border-node-active shadow-node-hover ring-2 ring-node-active/20",
        "min-w-[100px] min-h-[50px] p-4 flex items-center justify-center" // reduced min-w/min-h
      )}
      style={{
        width: nodeSize.width,
        height: nodeSize.height
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-node-active border-2 border-background opacity-0 hover:opacity-100 transition-opacity"
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-node-active border-2 border-background opacity-0 hover:opacity-100 transition-opacity"
      />
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-node-active border-2 border-background opacity-0 hover:opacity-100 transition-opacity"
      />
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-node-active border-2 border-background opacity-0 hover:opacity-100 transition-opacity"
      />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleTextSubmit}
          onKeyDown={handleKeyDown}
          className="w-full h-full resize-none border-none outline-none bg-transparent text-foreground text-sm placeholder:text-muted-foreground"
          placeholder="..."
          style={{
            minHeight: '40px',
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-center">
          <p className="text-sm text-foreground leading-relaxed break-words">
            {text || 'Double-click to edit'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ThoughtNode;