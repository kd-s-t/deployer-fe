import React from 'react';
import { Node, Connection, MapTransform } from './types';
import { Node as NodeComponent } from './Node';
import { Connection as ConnectionComponent } from './Connection';

interface CanvasProps {
  nodes: Node[];
  connections: Connection[];
  mapTransform: MapTransform;
  selectedNode: string | null;
  isPanning: boolean;
  draggedNode: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onSvgClick: (e: React.MouseEvent) => void;
  onNodeMouseDown: (e: React.MouseEvent, nodeId: string) => void;
  onNodeClick: (e: React.MouseEvent, nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  mapTransform,
  selectedNode,
  isPanning,
  draggedNode,
  onDragOver,
  onDrop,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onClick,
  onSvgClick,
  onNodeMouseDown,
  onNodeClick,
  onDeleteNode,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onClick}
      onWheel={onWheel}
      style={{ 
        border: '2px solid #dee2e6', 
        borderRadius: '8px',
        minHeight: '400px',
        position: 'relative',
        backgroundColor: '#fafafa',
        cursor: isPanning ? 'grabbing' : (draggedNode ? 'grabbing' : 'grab'),
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Map Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
            linear-gradient(180deg, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          opacity: 0.3,
          transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
          transformOrigin: '0 0'
        }}
      />

      {nodes.length === 0 ? (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${mapTransform.x}px), calc(-50% + ${mapTransform.y}px)) scale(${mapTransform.scale})`,
            textAlign: 'center',
            color: '#999',
            fontSize: '1.1rem',
            cursor: 'pointer'
          }}
          onClick={() => {
            onClick({ target: { currentTarget: null } } as any);
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <p>Drag components from the left panel to start building your workflow</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Use mouse wheel to zoom, drag empty space to pan like a map
          </p>
          {isPanning && (
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#007bff', fontWeight: 'bold' }}>
              🗺️ Map panning active - drag to explore
            </p>
          )}
        </div>
      ) : (
        <svg
          width="100%"
          height="400"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0,
            transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
            transformOrigin: '0 0'
          }}
          onClick={onSvgClick}
        >
          {/* Arrow markers */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="8"
              refX="10"
              refY="4"
              orient="auto"
            >
              <polygon
                points="0 0, 12 4, 0 8"
                fill="#3b82f6"
                stroke="#3b82f6"
                strokeWidth="1"
              />
            </marker>
            <marker
              id="arrowhead-auto"
              markerWidth="15"
              markerHeight="10"
              refX="12"
              refY="5"
              orient="auto"
            >
              <polygon
                points="0 0, 15 5, 0 10"
                fill="#007bff"
                stroke="#007bff"
                strokeWidth="1"
              />
            </marker>
          </defs>
          
          {/* Connections */}
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            
            return (
              <ConnectionComponent
                key={conn.id}
                connection={conn}
                fromNode={fromNode}
                toNode={toNode}
              />
            );
          })}
          
          {/* Nodes */}
          {nodes.map(node => (
            <NodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onMouseDown={onNodeMouseDown}
              onClick={onNodeClick}
              onDelete={onDeleteNode}
            />
          ))}
        </svg>
      )}
    </div>
  );
};
