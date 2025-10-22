import React, { useState, useRef } from 'react';
import { Node, DeploymentFlow } from './types';
import { menuCards, componentFrameworks } from './constants';

interface PropertiesNodeProps {
  selectedNode: Node;
  deploymentFlow: DeploymentFlow;
  onPropertyChange: (property: string, value: unknown) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

export const PropertiesNode: React.FC<PropertiesNodeProps> = ({
  selectedNode,
  deploymentFlow,
  onPropertyChange,
  onClose,
  onPositionChange,
}) => {
  const card = menuCards.find(c => c.type === selectedNode.type);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onPositionChange({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);
  
  // Get the appropriate label for the dropdown based on node type
  const getDropdownLabel = (nodeType: string) => {
    switch (nodeType) {
      case 'repository': return 'Platform';
      case 'cicd': return 'Service';
      case 'server': return 'Provider';
      default: return 'Framework';
    }
  };

  return (
    <div 
      ref={nodeRef}
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '1rem',
        minWidth: '320px',
        maxWidth: '380px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #f3f4f6',
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        <h3 style={{ 
          color: '#1f2937', 
          margin: 0,
          fontSize: '1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>{card?.icon}</span>
          {selectedNode.label} Properties
        </h3>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.125rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0.25rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Framework Selection */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.25rem', 
            fontWeight: '500',
            color: '#374151',
            fontSize: '0.75rem'
          }}>
            {getDropdownLabel(selectedNode.type)}
          </label>
          <select
            value={deploymentFlow.nodeProperties[selectedNode.id]?.framework || ''}
            onChange={(e) => onPropertyChange('framework', e.target.value)}
            style={{
              width: '100%',
              height: '32px',
              padding: '0 0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          >
            <option value="">Select framework</option>
            {componentFrameworks[selectedNode.type as keyof typeof componentFrameworks]?.map(framework => (
              <option 
                key={framework.value} 
                value={framework.value}
                disabled={(framework as any).disabled}
                style={(framework as any).disabled ? { color: '#9ca3af', fontStyle: 'italic' } : {}}
              >
                {framework.label}
              </option>
            ))}
          </select>
        </div>

        {/* Additional properties based on node type */}
        {selectedNode.type === 'frontend' && (
          <>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.25rem', 
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.75rem'
              }}>
                Styling
              </label>
              <select
                value={deploymentFlow.nodeProperties[selectedNode.id]?.styling || ''}
                onChange={(e) => onPropertyChange('styling', e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select styling</option>
                <option value="css">CSS</option>
                <option value="scss">SCSS</option>
                <option value="styled-components">Styled Components</option>
                <option value="tailwind">Tailwind CSS</option>
                <option value="emotion">Emotion</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.25rem', 
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.75rem'
              }}>
                State Management
              </label>
              <select
                value={deploymentFlow.nodeProperties[selectedNode.id]?.stateManagement || ''}
                onChange={(e) => onPropertyChange('stateManagement', e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select state management</option>
                <option value="redux">Redux</option>
                <option value="zustand">Zustand</option>
                <option value="context">React Context</option>
                <option value="recoil">Recoil</option>
                <option value="mobx">MobX</option>
              </select>
            </div>
          </>
        )}

        {selectedNode.type === 'backend' && (
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.25rem', 
              fontWeight: '500',
              color: '#374151',
              fontSize: '0.75rem'
            }}>
              Authentication
            </label>
            <select
              value={deploymentFlow.nodeProperties[selectedNode.id]?.auth || ''}
              onChange={(e) => onPropertyChange('auth', e.target.value)}
              style={{
                width: '100%',
                height: '32px',
                padding: '0 0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select authentication</option>
              <option value="jwt">JWT</option>
              <option value="oauth">OAuth</option>
              <option value="session">Session-based</option>
              <option value="passport">Passport.js</option>
            </select>
          </div>
        )}

        {selectedNode.type === 'database' && (
          <>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.25rem', 
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.75rem'
              }}>
                Database Type
              </label>
              <select
                value={deploymentFlow.nodeProperties[selectedNode.id]?.databaseType || ''}
                onChange={(e) => onPropertyChange('databaseType', e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select database type</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mongodb">MongoDB</option>
                <option value="redis">Redis</option>
                <option value="sqlite">SQLite</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.25rem', 
                fontWeight: '500',
                color: '#374151',
                fontSize: '0.75rem'
              }}>
                Connection String
              </label>
              <input
                type="text"
                value={deploymentFlow.nodeProperties[selectedNode.id]?.connectionString || ''}
                onChange={(e) => onPropertyChange('connectionString', e.target.value)}
                placeholder="postgresql://user:pass@localhost:5432/dbname"
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              />
            </div>
          </>
        )}

        {/* Common properties */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.25rem', 
            fontWeight: '500',
            color: '#374151',
            fontSize: '0.75rem'
          }}>
            Project Name
          </label>
          <input
            type="text"
            value={deploymentFlow.nodeProperties[selectedNode.id]?.projectName || ''}
            onChange={(e) => onPropertyChange('projectName', e.target.value)}
            placeholder="Enter project name"
            style={{
              width: '100%',
              height: '32px',
              padding: '0 0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem',
              backgroundColor: 'white'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.25rem', 
            fontWeight: '500',
            color: '#374151',
            fontSize: '0.75rem'
          }}>
            Description
          </label>
          <textarea
            value={deploymentFlow.nodeProperties[selectedNode.id]?.description || ''}
            onChange={(e) => onPropertyChange('description', e.target.value)}
            placeholder="Enter project description"
            rows={2}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem',
              resize: 'vertical',
              backgroundColor: 'white',
              minHeight: '60px'
            }}
          />
        </div>
      </div>
    </div>
  );
};
