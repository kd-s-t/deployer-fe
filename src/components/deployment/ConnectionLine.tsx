import React from 'react';
import { useConnection } from '@xyflow/react';

export default ({ fromX, fromY, toX, toY }) => {
  const { fromHandle } = useConnection();

  const getConnectionColor = (handleId: string) => {
    switch (handleId) {
      case 'right': return '#3b82f6'; // Blue for main connections
      case 'left': return '#8b5cf6'; // Purple for data connections
      default: return '#6c757d'; // Gray for default
    }
  };

  const connectionColor = getConnectionColor(fromHandle?.id || 'right');

  return (
    <g>
      <path
        fill="none"
        stroke={connectionColor}
        strokeWidth={2}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX + 50} ${fromY} ${toX - 50} ${toY} ${toX},${toY}`}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={4}
        stroke={connectionColor}
        strokeWidth={2}
      />
    </g>
  );
};
