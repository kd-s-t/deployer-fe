'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import { MenuPanel } from './MenuPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { menuCards, componentFrameworks } from './constants';
import { DeploymentFlow, Node as CustomNode, Connection as CustomConnection } from './types';
import CustomNodeComponent from './CustomNode';
import ConnectionLine from './ConnectionLine';

export const DeploymentFlowComponent: React.FC = () => {
  const router = useRouter();
  
  const [deploymentFlow, setDeploymentFlow] = useState<DeploymentFlow>({
    id: '1',
    name: 'New Deployment',
    description: 'Create a new deployment workflow',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    connections: [],
    nodeProperties: {},
    deploymentConfig: {
      environment: 'development',
      region: 'us-east-1',
      autoDeploy: false,
      notifications: true,
    },
    metadata: {
      totalNodes: 0,
      completedNodes: 0,
      lastDeployment: null,
    },
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [nodeCounter, setNodeCounter] = useState(1);
  const [connectionCounter, setConnectionCounter] = useState(1);
  const [usedOptionalTools, setUsedOptionalTools] = useState<Set<string>>(new Set());

  // Use React Flow hooks directly
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Handle drag start for menu cards
  const handleDragStart = (e: React.DragEvent, card: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify(card));
    e.dataTransfer.effectAllowed = 'copy';
    setSelectedCard(card);
  };

  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const cardData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (cardData) {
        const reactFlowBounds = e.currentTarget.getBoundingClientRect();
        const dropX = e.clientX - reactFlowBounds.left;
        const dropY = e.clientY - reactFlowBounds.top;
        
        // Smart positioning based on node type - CLEAR LEFT-CENTER-RIGHT LAYOUT
        let position = { x: dropX, y: dropY };
        
        if (cardData.type === 'frontend') {
          position = { x: 200, y: 300 }; // LEFT COLUMN
        } else if (cardData.type === 'backend') {
          position = { x: 500, y: 300 }; // CENTER COLUMN
        } else if (cardData.type === 'database') {
          position = { x: 500, y: 500 }; // CENTER COLUMN (below backend)
        } else if (cardData.type === 'repository') {
          position = { x: 800, y: 200 }; // RIGHT COLUMN
        } else if (cardData.type === 'cicd') {
          position = { x: 800, y: 400 }; // RIGHT COLUMN
        } else if (cardData.type === 'server') {
          position = { x: 800, y: 600 }; // RIGHT COLUMN
        } else if (cardData.type === 'optional') {
          // Optional tools go to the FAR LEFT
          position = { x: 50, y: dropY };
        }
      
        const newNode: Node = {
          id: `node-${nodeCounter}`,
          type: 'custom',
          position: { x: position.x, y: position.y },
          data: { 
            label: cardData.label,
            type: cardData.type
          },
          selected: false,
        };

        setNodes((nds) => [...nds, newNode]);

        // Update our custom state for properties
        setDeploymentFlow((prev: DeploymentFlow) => {
          const customNode: CustomNode = {
            id: newNode.id,
            type: cardData.type,
            x: position.x,
            y: position.y,
            label: cardData.label,
            status: 'pending',
            toolType: cardData.toolType,
          };

          const updatedNodes = [...prev.nodes, customNode];
          const updatedConnections = [...prev.connections];
          
          // Auto-connect logic
          let autoConnected = false;
          let connectionMessage = '';
          const newEdges: Edge[] = [];
          
          // Helper function to create unique connection ID
          const createConnectionId = (from: string, to: string) => {
            // Sort alphabetically to ensure consistent IDs
            const sorted = [from, to].sort();
            return `auto-conn-${sorted[0]}-${sorted[1]}`;
          };
          
          // Helper function to check if connection exists (bidirectional)
          const connectionExists = (from: string, to: string) => {
            return updatedConnections.some(conn => 
              (conn.from === from && conn.to === to) || 
              (conn.from === to && conn.to === from)
            );
          };
          
          if (customNode.type === 'frontend') {
            const backendNode = updatedNodes.find(node => node.type === 'backend');
            if (backendNode && !connectionExists(customNode.id, backendNode.id)) {
              const connectionId = createConnectionId(customNode.id, backendNode.id);
              updatedConnections.push({
                id: connectionId,
                from: customNode.id,
                to: backendNode.id
              });
              newEdges.push({
                id: connectionId,
                source: customNode.id,
                target: backendNode.id,
                animated: true,
                style: { stroke: '#3b82f6', strokeWidth: 3 },
                type: 'smoothstep'
              });
              autoConnected = true;
              connectionMessage = 'Frontend and Backend have been automatically connected';
            }
            
            const repositoryNode = updatedNodes.find(node => node.type === 'repository');
            if (repositoryNode && !connectionExists(customNode.id, repositoryNode.id)) {
              const connectionId = createConnectionId(customNode.id, repositoryNode.id);
              updatedConnections.push({
                id: connectionId,
                from: customNode.id,
                to: repositoryNode.id
              });
              newEdges.push({
                id: connectionId,
                source: customNode.id,
                target: repositoryNode.id,
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
                type: 'step'
              });
              autoConnected = true;
              connectionMessage = connectionMessage ? 
                'Frontend connected to Backend and Repository' : 
                'Frontend and Repository have been automatically connected';
            }
          } else if (customNode.type === 'backend') {
            const frontendNode = updatedNodes.find(node => node.type === 'frontend');
            if (frontendNode && !connectionExists(frontendNode.id, customNode.id)) {
                const connectionId = createConnectionId(frontendNode.id, customNode.id);
                updatedConnections.push({
                  id: connectionId,
                  from: frontendNode.id,
                  to: customNode.id
                });
                newEdges.push({
                  id: connectionId,
                  source: frontendNode.id,
                  target: customNode.id,
                  animated: true,
                  style: { stroke: '#3b82f6', strokeWidth: 3 },
                  type: 'smoothstep'
                });
                autoConnected = true;
                connectionMessage = 'Frontend and Backend have been automatically connected';
              }
            
            const databaseNode = updatedNodes.find(node => node.type === 'database');
            if (databaseNode && !connectionExists(customNode.id, databaseNode.id)) {
              const connectionId = createConnectionId(customNode.id, databaseNode.id);
              updatedConnections.push({
                id: connectionId,
                from: customNode.id,
                to: databaseNode.id
              });
              newEdges.push({
                id: connectionId,
                source: customNode.id,
                target: databaseNode.id,
                animated: true,
                style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5,5' },
                type: 'straight'
              });
              autoConnected = true;
              connectionMessage = connectionMessage ? 
                'Backend connected to Frontend and Database' : 
                'Backend and Database have been automatically connected';
            }
            
            const repositoryNode = updatedNodes.find(node => node.type === 'repository');
            if (repositoryNode && !connectionExists(customNode.id, repositoryNode.id)) {
              const connectionId = createConnectionId(customNode.id, repositoryNode.id);
              updatedConnections.push({
                id: connectionId,
                from: customNode.id,
                to: repositoryNode.id
              });
              newEdges.push({
                id: connectionId,
                source: customNode.id,
                target: repositoryNode.id,
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
                type: 'step'
              });
              autoConnected = true;
              connectionMessage = connectionMessage ? 
                'Backend connected to Frontend, Database, and Repository' : 
                'Backend and Repository have been automatically connected';
            }
          } else if (customNode.type === 'database') {
            const backendNode = updatedNodes.find(node => node.type === 'backend');
            if (backendNode && !connectionExists(backendNode.id, customNode.id)) {
              const connectionId = createConnectionId(backendNode.id, customNode.id);
              updatedConnections.push({
                id: connectionId,
                from: backendNode.id,
                to: customNode.id
              });
              newEdges.push({
                id: connectionId,
                source: backendNode.id,
                target: customNode.id,
                animated: true
              });
              autoConnected = true;
              connectionMessage = 'Backend and Database have been automatically connected';
            }
          } else if (customNode.type === 'repository') {
            const frontendNode = updatedNodes.find(node => node.type === 'frontend');
            const backendNode = updatedNodes.find(node => node.type === 'backend');
            
            if (frontendNode && !connectionExists(frontendNode.id, customNode.id)) {
              const connectionId = createConnectionId(frontendNode.id, customNode.id);
              updatedConnections.push({
                id: connectionId,
                from: frontendNode.id,
                to: customNode.id
              });
              newEdges.push({
                id: connectionId,
                source: frontendNode.id,
                target: customNode.id,
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
                type: 'step'
              });
              autoConnected = true;
              connectionMessage = 'Repository connected to Frontend';
            }
            
            if (backendNode && !connectionExists(backendNode.id, customNode.id)) {
              const connectionId = createConnectionId(backendNode.id, customNode.id);
              updatedConnections.push({
                id: connectionId,
                from: backendNode.id,
                to: customNode.id
              });
              newEdges.push({
                id: connectionId,
                source: backendNode.id,
                target: customNode.id,
                animated: true,
                style: { stroke: '#6366f1', strokeWidth: 2 },
                type: 'step'
              });
              autoConnected = true;
              connectionMessage = connectionMessage ? 
                'Repository connected to Frontend and Backend' : 
                'Repository connected to Backend';
            }
            
            const cicdNode = updatedNodes.find(node => node.type === 'cicd');
            if (cicdNode && !connectionExists(customNode.id, cicdNode.id)) {
              const connectionId = createConnectionId(customNode.id, cicdNode.id);
              updatedConnections.push({
                id: connectionId,
                from: customNode.id,
                to: cicdNode.id
              });
              newEdges.push({
                id: connectionId,
                source: customNode.id,
                target: cicdNode.id,
                animated: true,
                style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '10,5' },
                type: 'smoothstep'
              });
              autoConnected = true;
              connectionMessage = connectionMessage ? 
                'Repository connected to Frontend, Backend, and CI/CD' : 
                'Repository and CI/CD have been automatically connected';
            }
          } else if (customNode.type === 'cicd') {
            const repositoryNode = updatedNodes.find(node => node.type === 'repository');
            if (repositoryNode && !connectionExists(repositoryNode.id, customNode.id)) {
              const connectionId = createConnectionId(repositoryNode.id, customNode.id);
              updatedConnections.push({
                id: connectionId,
                from: repositoryNode.id,
                to: customNode.id
              });
              newEdges.push({
                id: connectionId,
                source: repositoryNode.id,
                target: customNode.id,
                animated: true,
                style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '10,5' },
                type: 'smoothstep'
              });
              autoConnected = true;
              connectionMessage = 'CI/CD connected to Repository';
            }
            
            const serverNode = updatedNodes.find(node => node.type === 'server');
            if (serverNode && !connectionExists(customNode.id, serverNode.id)) {
              const connectionId = createConnectionId(customNode.id, serverNode.id);
              updatedConnections.push({
                id: connectionId,
                from: customNode.id,
                to: serverNode.id
              });
              newEdges.push({
                id: connectionId,
                source: customNode.id,
                target: serverNode.id,
                animated: true,
                style: { stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '15,5' },
                type: 'straight'
              });
              autoConnected = true;
              connectionMessage = connectionMessage ? 
                'CI/CD connected to Repository and Server' : 
                'CI/CD and Server have been automatically connected';
            }
          } else if (customNode.type === 'server') {
            const cicdNode = updatedNodes.find(node => node.type === 'cicd');
            if (cicdNode && !connectionExists(cicdNode.id, customNode.id)) {
              const connectionId = createConnectionId(cicdNode.id, customNode.id);
              updatedConnections.push({
                id: connectionId,
                from: cicdNode.id,
                to: customNode.id
              });
              newEdges.push({
                id: connectionId,
                source: cicdNode.id,
                target: customNode.id,
                animated: true,
                style: { stroke: '#ef4444', strokeWidth: 3, strokeDasharray: '15,5' },
                type: 'straight'
              });
              autoConnected = true;
              connectionMessage = 'Server connected to CI/CD';
            }
          } else if (customNode.type === 'optional') {
            // Auto-connect ALL optional tools to the currently selected/active node
            if (selectedNode) {
              const activeNode = updatedNodes.find(node => node.id === selectedNode);
              
              if (activeNode && !connectionExists(activeNode.id, customNode.id)) {
                const connectionId = createConnectionId(activeNode.id, customNode.id);
                updatedConnections.push({
                  id: connectionId,
                  from: activeNode.id,
                  to: customNode.id
                });
                newEdges.push({
                  id: connectionId,
                  source: activeNode.id,
                  target: customNode.id,
                  animated: true
                });
                autoConnected = true;
                connectionMessage = `${customNode.label} connected to ${activeNode.label}`;
              }
            }
          }

          // Add new edges to React Flow (check for duplicates)
          if (newEdges.length > 0) {
            setEdges((eds) => {
              const existingIds = new Set(eds.map(e => e.id));
              const uniqueNewEdges = newEdges.filter(edge => !existingIds.has(edge.id));
              return [...eds, ...uniqueNewEdges];
            });
          }

          // Show toast notification for auto-connection
          if (autoConnected) {
            setTimeout(() => {
              toast.info('Auto-connected components', {
                description: connectionMessage,
                duration: 3000,
              });
            }, 100);
          }

          return {
            ...prev,
            nodes: updatedNodes,
            connections: updatedConnections,
            nodeProperties: {
              ...prev.nodeProperties,
              [customNode.id]: {},
            },
            metadata: {
              ...prev.metadata,
              totalNodes: prev.nodes.length + 1,
            },
            updatedAt: new Date().toISOString(),
          };
        });

        setNodeCounter(prev => prev + 1);
        
        // Track used optional tools
        if (cardData.type === 'optional') {
          setUsedOptionalTools(prev => new Set([...prev, cardData.toolType]));
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle new connections
  const onConnect = useCallback((params: Connection) => {
    const newEdge: Edge = {
      id: `connection-${connectionCounter}`,
      source: params.source!,
      target: params.target!,
      animated: true,
    };

    setEdges((eds) => addEdge(newEdge, eds));

    // Update our custom state
    const newConnection: CustomConnection = {
      id: newEdge.id,
      from: params.source!,
      to: params.target!,
    };

    setDeploymentFlow((prev: DeploymentFlow) => ({
      ...prev,
      connections: [...prev.connections, newConnection],
      updatedAt: new Date().toISOString(),
    }));

    setConnectionCounter(prev => prev + 1);
  }, [connectionCounter]);

  // Handle node click
  const handleNodeClick = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    setSelectedNode(node.id);
    
    // Update node selection state
    setNodes((nds) => 
      nds.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );
  };

  // Handle canvas click
  const handleCanvasClick = () => {
    setSelectedNode(null);
    
    // Clear node selection state
    setNodes((nds) => 
      nds.map((n) => ({
        ...n,
        selected: false,
      }))
    );
  };

  // Handle property changes
  const handlePropertyChange = (property: string, value: unknown) => {
    if (selectedNode) {
      setDeploymentFlow((prev: DeploymentFlow) => ({
        ...prev,
        nodeProperties: {
          ...prev.nodeProperties,
          [selectedNode]: {
            ...prev.nodeProperties[selectedNode],
            [property]: value,
          },
        },
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  // Handle node deletion
  const handleDeleteNode = (nodeId: string) => {
    // Find the node to get its toolType for optional tools
    const nodeToDelete = deploymentFlow.nodes.find((n: CustomNode) => n.id === nodeId);
    
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    
    setDeploymentFlow((prev: DeploymentFlow) => ({
      ...prev,
      nodes: prev.nodes.filter((n: CustomNode) => n.id !== nodeId),
      connections: prev.connections.filter((c: CustomConnection) => c.from !== nodeId && c.to !== nodeId),
      nodeProperties: Object.fromEntries(
        Object.entries(prev.nodeProperties).filter(([key]) => key !== nodeId)
      ),
      metadata: {
        ...prev.metadata,
        totalNodes: prev.metadata.totalNodes - 1,
      },
      updatedAt: new Date().toISOString(),
    }));
    
    // Remove from used optional tools if it was an optional tool
    if (nodeToDelete?.type === 'optional' && nodeToDelete.toolType) {
      setUsedOptionalTools(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeToDelete.toolType);
        return newSet;
      });
    }
    
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  // Handle save
  const handleSave = () => {
    try {
      console.log('Saving deployment flow:', deploymentFlow);
      toast.success('Deployment flow saved successfully!');
    } catch (error) {
      console.error('Error saving deployment flow:', error);
      toast.error('Failed to save deployment flow');
    }
  };

  // Check for required components
  const hasRequiredComponents = () => {
    const nodeTypes = deploymentFlow.nodes.map((n: CustomNode) => n.type);
    return (
      nodeTypes.includes('backend') &&
      nodeTypes.includes('database') &&
      nodeTypes.includes('server')
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f4f7f6' }}>
      {/* Left Menu Panel */}
      <MenuPanel
        selectedNode={selectedNode}
        onDragStart={handleDragStart}
        onCardClick={() => setSelectedCard(null)}
        usedOptionalTools={usedOptionalTools}
      />

      {/* Main Canvas Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '1rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
              {deploymentFlow.name}
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              {deploymentFlow.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              {deploymentFlow.metadata.totalNodes} components
            </div>
            <button
              onClick={handleSave}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div 
          style={{ flex: 1, position: 'relative', height: '600px' }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={{ custom: CustomNodeComponent }}
            connectionLineComponent={ConnectionLine}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onClick={handleCanvasClick}
            attributionPosition="top-right"
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        {/* Warnings */}
        {!hasRequiredComponents() && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            padding: '1rem',
            margin: '1rem',
            borderRadius: '4px',
            color: '#856404'
          }}>
            <strong>⚠️ Required Components Missing:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem' }}>
              {!deploymentFlow.nodes.some(n => n.type === 'backend') && <li>Backend</li>}
              {!deploymentFlow.nodes.some(n => n.type === 'database') && <li>Database</li>}
              {!deploymentFlow.nodes.some(n => n.type === 'server') && <li>Server</li>}
            </ul>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Add these components to enable deployment.
            </p>
          </div>
        )}
      </div>

      {/* Right Properties Panel */}
      <PropertiesPanel
        selectedNode={selectedNode}
        nodes={deploymentFlow.nodes}
        deploymentFlow={deploymentFlow}
        onPropertyChange={handlePropertyChange}
      />
    </div>
  );
};