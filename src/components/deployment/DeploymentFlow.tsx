'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import { MenuPanel } from './MenuPanel';
import { PropertiesNode } from './PropertiesNode';
import { menuCards, componentFrameworks } from './constants';
import { DeploymentFlow, Node as CustomNode, Connection as CustomConnection } from './types';
import CustomNodeComponent from './CustomNode';
import FloatingEdge from './FloatingEdge';
import FloatingConnectionLine from './FloatingConnectionLine';
import { getApiUrl } from '../../lib/config';

interface DeploymentFlowComponentProps {
  deploymentId?: string | null;
}

export const DeploymentFlowComponent: React.FC<DeploymentFlowComponentProps> = ({ deploymentId }) => {
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
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [nodeCounter, setNodeCounter] = useState(1);
  const nodeIdCounter = useRef(0);
  const lastDropTime = useRef(0);
  const isCreatingNode = useRef(false);
  const [connectionCounter, setConnectionCounter] = useState(1);
  const [usedOptionalTools, setUsedOptionalTools] = useState<Set<string>>(new Set());
  const [propertiesNodePosition, setPropertiesNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const edgeReconnectSuccessful = useRef(true);

  // Use React Flow hooks directly
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  // ReactFlow nodes are now managed by useNodesState - no conversion needed

  // Debug: Log edges state (removed to prevent infinite loop)

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
    
    // Prevent multiple rapid drops (debounce)
    const now = Date.now();
    if (now - lastDropTime.current < 100) {
      console.log('Drop debounced - too soon');
      return;
    }
    
    // Prevent multiple simultaneous node creation
    if (isCreatingNode.current) {
      console.log('Already creating a node, ignoring drop');
      return;
    }
    
    lastDropTime.current = now;
    isCreatingNode.current = true;
    
    try {
      const cardData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (cardData) {
        console.log('Creating node for card:', cardData.label);
        const reactFlowBounds = e.currentTarget.getBoundingClientRect();
        const dropX = e.clientX - reactFlowBounds.left;
        const dropY = e.clientY - reactFlowBounds.top;
        
        // Use actual drop position for all nodes
        let position = { x: dropX, y: dropY };
        
        // Optional adjustment for specific node types if needed
        if (cardData.type === 'optional') {
          // Optional tools go to the FAR LEFT but use actual Y position
          position = { x: 50, y: dropY };
        }
      
        nodeIdCounter.current += 1;
        const uniqueId = `${Date.now()}-${nodeIdCounter.current}-${Math.random().toString(36).substr(2, 9)}`;
        const nodeId = `node-${uniqueId}`;
        console.log('Generated node ID:', nodeId);
        
             // Check if node with this ID already exists in both states
             const existingNode = deploymentFlow.nodes.find(n => n.id === nodeId);
             const existingReactFlowNode = nodes.find(n => n.id === nodeId);
             if (existingNode || existingReactFlowNode) {
               console.warn('Node with ID already exists:', nodeId);
               return;
             }
        
        const newNode: Node = {
          id: nodeId,
          type: 'custom',
          position: { x: position.x, y: position.y },
          data: { 
            label: cardData.label,
            type: cardData.type
          },
          selected: false,
        };

        // Update our custom state for properties first
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
                style: { stroke: '#3b82f6', strokeWidth: 4 },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                style: { stroke: '#6366f1', strokeWidth: 3 },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                  style: { stroke: '#3b82f6', strokeWidth: 4 },
                  type: 'floating',
                  markerEnd: { type: MarkerType.Arrow }
                });
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
                style: { stroke: '#8b5cf6', strokeWidth: 3, strokeDasharray: '5,5' },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                style: { stroke: '#6366f1', strokeWidth: 3 },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                animated: true,
                style: { stroke: '#8b5cf6', strokeWidth: 3, strokeDasharray: '5,5' },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                style: { stroke: '#6366f1', strokeWidth: 3 },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                style: { stroke: '#6366f1', strokeWidth: 3 },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                style: { stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '10,5' },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                style: { stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '10,5' },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                style: { stroke: '#ef4444', strokeWidth: 4, strokeDasharray: '15,5' },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                style: { stroke: '#ef4444', strokeWidth: 4, strokeDasharray: '15,5' },
                type: 'floating',
                markerEnd: { type: MarkerType.Arrow }
              });
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
                  animated: true,
                  type: 'floating',
                  markerEnd: { type: MarkerType.Arrow }
                });
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

          // Auto-connections happen silently - no toast on drop

          const updatedFlow = {
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

          // Add node to ReactFlow state (this is the single source of truth for rendering)
          setNodes((nds) => [...nds, newNode]);

          return updatedFlow;
        });

        setNodeCounter(prev => prev + 1);
        
        // Track used optional tools
        if (cardData.type === 'optional') {
          setUsedOptionalTools(prev => new Set([...prev, cardData.toolType]));
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    } finally {
      // Reset the flag to allow future node creation
      isCreatingNode.current = false;
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
      type: 'floating',
      animated: true,
      markerEnd: { type: MarkerType.Arrow },
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

  // Handle edge reconnection start
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  // Handle edge reconnection
  const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    
    // Update our custom state
    setDeploymentFlow((prev: DeploymentFlow) => ({
      ...prev,
      connections: prev.connections.map((conn: CustomConnection) => 
        conn.id === oldEdge.id 
          ? { ...conn, from: newConnection.source!, to: newConnection.target! }
          : conn
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Handle edge reconnection end
  const onReconnectEnd = useCallback((_, edge: Edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      
      // Update our custom state
      setDeploymentFlow((prev: DeploymentFlow) => ({
        ...prev,
        connections: prev.connections.filter((conn: CustomConnection) => conn.id !== edge.id),
        updatedAt: new Date().toISOString(),
      }));
    }

    edgeReconnectSuccessful.current = true;
  }, []);

  // Handle node click
  const handleNodeClick = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    
    // Set all states together to ensure consistency
    setSelectedNode(node.id);
    setActiveNode(node);
    
    // Position properties node to the right of the clicked node
    const newPosition = {
      x: node.position.x + 300,
      y: node.position.y
    };
    setPropertiesNodePosition(newPosition);
  };

  // Handle canvas click
  const handleCanvasClick = () => {
    setSelectedNode(null);
    setActiveNode(null);
    setPropertiesNodePosition(null);
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
    const nodeToDelete = nodes.find((n: Node) => n.id === nodeId);
    
    // Remove from ReactFlow state
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    
    // Update deploymentFlow state for persistence
    setDeploymentFlow((prev: DeploymentFlow) => ({
      ...prev,
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
    if (nodeToDelete?.data?.type === 'optional' && nodeToDelete.data?.toolType) {
      setUsedOptionalTools(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeToDelete.data.toolType);
        return newSet;
      });
    }
    
    if (selectedNode === nodeId) {
      setSelectedNode(null);
      setActiveNode(null);
      setPropertiesNodePosition(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to save deployment flows');
        return;
      }

      // Prepare the data for the API
      const saveData = {
        name: deploymentFlow.name,
        description: deploymentFlow.description,
        status: deploymentFlow.status,
        environment: deploymentFlow.deploymentConfig.environment,
        region: deploymentFlow.deploymentConfig.region,
        autoDeploy: deploymentFlow.deploymentConfig.autoDeploy,
        notifications: deploymentFlow.deploymentConfig.notifications,
        nodes: nodes.map((node: Node) => ({
          nodeId: node.id,
          type: node.data.type,
          xPosition: node.position.x,
          yPosition: node.position.y,
          label: node.data.label,
          status: node.data.status,
          toolType: node.data.toolType,
          properties: deploymentFlow.nodeProperties[node.id] || {},
        })),
        connections: deploymentFlow.connections.map((conn: CustomConnection) => ({
          connectionId: conn.id,
          fromNodeId: conn.from,
          toNodeId: conn.to,
        })),
      };

      const response = await fetch(getApiUrl('/deployment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        throw new Error('Failed to save deployment flow');
      }

      const savedFlow = await response.json();
      console.log('Saved deployment flow:', savedFlow);
      
      // Update the local state with the saved flow ID
      setDeploymentFlow(prev => ({
        ...prev,
        id: savedFlow.id,
        updatedAt: new Date().toISOString(),
      }));

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
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <button
                     onClick={() => router.push('/dashboard')}
                     style={{
                       padding: '0.5rem 1rem',
                       backgroundColor: '#f3f4f6',
                       color: '#374151',
                       border: '1px solid #d1d5db',
                       borderRadius: '6px',
                       cursor: 'pointer',
                       fontSize: '0.9rem',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.5rem'
                     }}
                   >
                     ← Back to Dashboard
                   </button>
                   <div>
                     <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
                       {deploymentFlow.name}
                     </h1>
                     <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                       {deploymentFlow.description}
                     </p>
                   </div>
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
            edgeTypes={{ floating: FloatingEdge }}
            connectionLineComponent={FloatingConnectionLine}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
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

      {/* Properties Node */}
      {activeNode && propertiesNodePosition && (
        <div
          style={{
            position: 'absolute',
            left: propertiesNodePosition.x,
            top: propertiesNodePosition.y,
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
        >
          <PropertiesNode
            selectedNode={activeNode!}
            deploymentFlow={deploymentFlow}
            onPropertyChange={handlePropertyChange}
            onClose={() => {
              setSelectedNode(null);
              setActiveNode(null);
              setPropertiesNodePosition(null);
            }}
            onPositionChange={setPropertiesNodePosition}
          />
        </div>
      )}
    </div>
  );
};