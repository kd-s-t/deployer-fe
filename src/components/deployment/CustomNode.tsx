import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { menuCards } from './constants';

export default memo(({ data }) => {
  const getNodeColor = (type: string) => {
    const card = menuCards.find(c => c.type === type);
    return card ? card.color : '#6c757d';
  };

  const nodeColor = getNodeColor(data.type);
  const isOptional = data.type === 'optional';

  return (
    <div style={{ 
      padding: isOptional ? '10px' : '15px 20px',
      backgroundColor: 'white',
      border: `2px solid ${nodeColor}`,
      borderRadius: isOptional ? '50%' : '8px',
      minWidth: isOptional ? '60px' : '120px',
      minHeight: isOptional ? '60px' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {data.label}
      
      {/* Minimal handles for connections */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ 
          width: 6, 
          height: 6, 
          background: 'transparent',
          border: '1px solid #e5e7eb',
          opacity: 0.3
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ 
          width: 6, 
          height: 6, 
          background: 'transparent',
          border: '1px solid #e5e7eb',
          opacity: 0.3
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ 
          width: 6, 
          height: 6, 
          background: 'transparent',
          border: '1px solid #e5e7eb',
          opacity: 0.3
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ 
          width: 6, 
          height: 6, 
          background: 'transparent',
          border: '1px solid #e5e7eb',
          opacity: 0.3
        }}
      />
    </div>
  );
});
