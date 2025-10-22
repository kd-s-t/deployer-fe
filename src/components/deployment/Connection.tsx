import React from 'react';
import { Connection as ConnectionType, Node as NodeType } from './types';

interface ConnectionProps {
  connection: ConnectionType;
  fromNode: NodeType;
  toNode: NodeType;
}

export const Connection: React.FC<ConnectionProps> = ({
  connection,
  fromNode,
  toNode,
}) => {
  return (
    <line
      key={connection.id}
      x1={fromNode.x + 30}
      y1={fromNode.y + 30}
      x2={toNode.x + 30}
      y2={toNode.y + 30}
      stroke={connection.id.includes('conn-') ? "#007bff" : "#6c757d"}
      strokeWidth={connection.id.includes('conn-') ? "3" : "2"}
      markerEnd={connection.id.includes('conn-') ? "url(#arrowhead-auto)" : "url(#arrowhead)"}
      strokeDasharray={connection.id.includes('conn-') ? "5,5" : "none"}
    />
  );
};
