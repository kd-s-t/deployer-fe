import React from 'react';
import { Node as NodeType, MenuCard } from './types';
import { menuCards } from './constants';

interface NodeProps {
  node: NodeType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onClick: (e: React.MouseEvent, nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

export const Node: React.FC<NodeProps> = ({
  node,
  isSelected,
  onMouseDown,
  onClick,
  onDelete,
}) => {
  const getNodeColor = (type: string, status: string) => {
    const card = menuCards.find(c => c.type === type);
    const baseColor = card?.color || '#6c757d';
    
    switch (status) {
      case 'success': return '#28a745';
      case 'running': return '#ffc107';
      case 'error': return '#dc3545';
      default: return baseColor;
    }
  };

  const getNodeIcon = (node: NodeType) => {
    if (node.type === 'optional') {
      return '🔧'; // All optional tools use the same icon
    }
    const card = menuCards.find(c => c.type === node.type);
    return card?.icon || '⚙️';
  };

  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width="60"
        height="60"
        rx="8"
        fill={getNodeColor(node.type, node.status)}
        stroke={isSelected ? '#007bff' : 'transparent'}
        strokeWidth={isSelected ? '3' : '0'}
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => onMouseDown(e, node.id)}
        onClick={(e) => onClick(e, node.id)}
      />
      <text
        x={node.x + 30}
        y={node.y + 35}
        textAnchor="middle"
        fill="white"
        fontSize="20"
        fontWeight="bold"
      >
        {getNodeIcon(node)}
      </text>
      <text
        x={node.x + 30}
        y={node.y + 80}
        textAnchor="middle"
        fill="#333"
        fontSize="12"
        fontWeight="500"
      >
        {node.label}
      </text>
      {isSelected && (
        <g>
          <circle
            cx={node.x + 60}
            cy={node.y}
            r="8"
            fill="#dc3545"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
          />
          <text
            x={node.x + 60}
            y={node.y + 3}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
};
