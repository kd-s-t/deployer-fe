import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const DEFAULT_HANDLE_STYLE = {
  width: 8,
  height: 8,
  bottom: -4,
  right: -4,
};

export default memo(({ data, isConnectable }) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'frontend': return '#3b82f6';
      case 'backend': return '#10b981';
      case 'database': return '#8b5cf6';
      case 'repository': return '#6366f1';
      case 'cicd': return '#f59e0b';
      case 'server': return '#ef4444';
      default: return '#6c757d';
    }
  };

  const nodeColor = getNodeColor(data.type);

  return (
    <>
      <div style={{ 
        padding: '15px 20px',
        backgroundColor: 'white',
        border: `2px solid ${nodeColor}`,
        borderRadius: '8px',
        minWidth: '120px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {data.label}
        
        {/* Right side handle for outgoing connections */}
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{ 
            ...DEFAULT_HANDLE_STYLE, 
            background: nodeColor,
            border: '2px solid white'
          }}
          isConnectable={isConnectable}
        />
        
        {/* Left side handle for incoming connections */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{ 
            ...DEFAULT_HANDLE_STYLE, 
            background: nodeColor,
            border: '2px solid white',
            left: -4
          }}
          isConnectable={isConnectable}
        />
        
        {/* Top handle for incoming connections */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{ 
            ...DEFAULT_HANDLE_STYLE, 
            background: nodeColor,
            border: '2px solid white',
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          isConnectable={isConnectable}
        />
        
        {/* Bottom handle for outgoing connections */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{ 
            ...DEFAULT_HANDLE_STYLE, 
            background: nodeColor,
            border: '2px solid white',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          isConnectable={isConnectable}
        />
      </div>
    </>
  );
});
