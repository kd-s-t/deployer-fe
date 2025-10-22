import React from 'react';
import { Node, DeploymentFlow, NodeProperties } from './types';
import { menuCards, componentFrameworks } from './constants';

interface PropertiesPanelProps {
  selectedNode: string | null;
  nodes: Node[];
  deploymentFlow: DeploymentFlow;
  onPropertyChange: (property: string, value: unknown) => void;
  onClose: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  nodes,
  deploymentFlow,
  onPropertyChange,
  onClose,
}) => {
  if (!selectedNode) return null;

  const node = nodes.find(n => n.id === selectedNode);
  if (!node) return null;

  const card = menuCards.find(c => c.type === node.type);
  
  // Get the appropriate label for the dropdown based on node type
  const getDropdownLabel = (nodeType: string) => {
    switch (nodeType) {
      case 'repository': return 'Platform';
      case 'cicd': return 'Service';
      case 'server': return 'Provider';
      default: return 'Framework';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        padding: '2rem',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666',
            padding: '0.25rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ×
        </button>

        <h3 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '1.1rem', paddingRight: '2rem' }}>
          {card?.icon} {node.label} Properties
        </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Framework Selection */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#333'
          }}>
            {getDropdownLabel(node.type)}
          </label>
          <select
            value={deploymentFlow.nodeProperties[node.id]?.framework || ''}
            onChange={(e) => onPropertyChange('framework', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          >
            <option value="">Select framework</option>
            {componentFrameworks[node.type as keyof typeof componentFrameworks]?.map(framework => (
              <option 
                key={framework.value} 
                value={framework.value}
                disabled={(framework as any).disabled}
                style={(framework as any).disabled ? { color: '#999', fontStyle: 'italic' } : {}}
              >
                {framework.label}
              </option>
            ))}
          </select>
        </div>

        {/* Additional properties based on node type */}
        {node.type === 'frontend' && (
          <>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                Styling
              </label>
              <select
                value={deploymentFlow.nodeProperties[node.id]?.styling || ''}
                onChange={(e) => onPropertyChange('styling', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
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
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                State Management
              </label>
              <select
                value={deploymentFlow.nodeProperties[node.id]?.stateManagement || ''}
                onChange={(e) => onPropertyChange('stateManagement', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
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

        {node.type === 'backend' && (
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#333'
            }}>
              Authentication
            </label>
            <select
              value={deploymentFlow.nodeProperties[node.id]?.auth || ''}
              onChange={(e) => onPropertyChange('auth', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
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

        {node.type === 'database' && (
          <>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                Database Type
              </label>
              <select
                value={deploymentFlow.nodeProperties[node.id]?.databaseType || ''}
                onChange={(e) => onPropertyChange('databaseType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
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
                marginBottom: '0.5rem', 
                fontWeight: '500',
                color: '#333'
              }}>
                Connection String
              </label>
              <input
                type="text"
                value={deploymentFlow.nodeProperties[node.id]?.connectionString || ''}
                onChange={(e) => onPropertyChange('connectionString', e.target.value)}
                placeholder="postgresql://user:pass@localhost:5432/dbname"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </>
        )}

        {/* Common properties */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#333'
          }}>
            Project Name
          </label>
          <input
            type="text"
            value={deploymentFlow.nodeProperties[node.id]?.projectName || ''}
            onChange={(e) => onPropertyChange('projectName', e.target.value)}
            placeholder="Enter project name"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#333'
          }}>
            Description
          </label>
          <textarea
            value={deploymentFlow.nodeProperties[node.id]?.description || ''}
            onChange={(e) => onPropertyChange('description', e.target.value)}
            placeholder="Enter project description"
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem',
              resize: 'vertical'
            }}
          />
        </div>
      </div>
      </div>
    </div>
  );
};
