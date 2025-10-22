import React from 'react';
import { Node, DeploymentFlow, NodeProperties } from './types';
import { menuCards, componentFrameworks } from './constants';

interface PropertiesPanelProps {
  selectedNode: string | null;
  nodes: Node[];
  deploymentFlow: DeploymentFlow;
  onPropertyChange: (property: string, value: unknown) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  nodes,
  deploymentFlow,
  onPropertyChange,
}) => {
  if (!selectedNode) return null;

  const node = nodes.find(n => n.id === selectedNode);
  if (!node) return null;

  const card = menuCards.find(c => c.type === node.type);

  return (
    <div style={{
      width: '300px',
      backgroundColor: 'white',
      borderRadius: '0',
      boxShadow: 'none',
      padding: '1.5rem',
      height: 'fit-content'
    }}>
      <h3 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
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
            Framework
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
              <option key={framework.value} value={framework.value}>
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
  );
};
