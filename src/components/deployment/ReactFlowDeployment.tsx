'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node Components
const FrontendNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    style={{
      background: '#3b82f6',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      minWidth: '120px',
      textAlign: 'center',
      border: selected ? '2px solid #1d4ed8' : '2px solid transparent',
    }}
  >
    <div style={{ fontSize: '20px', marginBottom: '5px' }}>🌐</div>
    <div style={{ fontWeight: 'bold' }}>Frontend</div>
    {data.framework && <div style={{ fontSize: '12px', opacity: 0.8 }}>{data.framework}</div>}
  </div>
);

const BackendNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    style={{
      background: '#10b981',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      minWidth: '120px',
      textAlign: 'center',
      border: selected ? '2px solid #047857' : '2px solid transparent',
    }}
  >
    <div style={{ fontSize: '20px', marginBottom: '5px' }}>⚙️</div>
    <div style={{ fontWeight: 'bold' }}>Backend</div>
    {data.framework && <div style={{ fontSize: '12px', opacity: 0.8 }}>{data.framework}</div>}
  </div>
);

const DatabaseNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    style={{
      background: '#8b5cf6',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      minWidth: '120px',
      textAlign: 'center',
      border: selected ? '2px solid #6d28d9' : '2px solid transparent',
    }}
  >
    <div style={{ fontSize: '20px', marginBottom: '5px' }}>🗄️</div>
    <div style={{ fontWeight: 'bold' }}>Database</div>
    {data.databaseType && <div style={{ fontSize: '12px', opacity: 0.8 }}>{data.databaseType}</div>}
  </div>
);

const DevOpsNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    style={{
      background: '#f59e0b',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      minWidth: '120px',
      textAlign: 'center',
      border: selected ? '2px solid #d97706' : '2px solid transparent',
    }}
  >
    <div style={{ fontSize: '20px', marginBottom: '5px' }}>🔧</div>
    <div style={{ fontWeight: 'bold' }}>DevOps & CI/CD</div>
    {data.tool && <div style={{ fontSize: '12px', opacity: 0.8 }}>{data.tool}</div>}
  </div>
);

const ServerNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    style={{
      background: '#ef4444',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      minWidth: '120px',
      textAlign: 'center',
      border: selected ? '2px solid #dc2626' : '2px solid transparent',
    }}
  >
    <div style={{ fontSize: '20px', marginBottom: '5px' }}>🖥️</div>
    <div style={{ fontWeight: 'bold' }}>Server</div>
    {data.provider && <div style={{ fontSize: '12px', opacity: 0.8 }}>{data.provider}</div>}
  </div>
);

const OptionalNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div
    style={{
      background: '#6c757d',
      color: 'white',
      padding: '8px',
      borderRadius: '6px',
      minWidth: '100px',
      textAlign: 'center',
      border: selected ? '2px solid #495057' : '2px solid transparent',
      fontSize: '12px',
    }}
  >
    <div style={{ fontSize: '16px', marginBottom: '3px' }}>🔧</div>
    <div style={{ fontWeight: 'bold' }}>{data.label}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  frontend: FrontendNode,
  backend: BackendNode,
  database: DatabaseNode,
  devops: DevOpsNode,
  server: ServerNode,
  optional: OptionalNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const ReactFlowDeployment: React.FC = () => {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        style: { stroke: '#007bff', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          color: '#007bff',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const addNode = (type: string, label: string, data: any = {}) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: { label, ...data },
    };

    setNodes((nds) => {
      const updatedNodes = [...nds, newNode];
      
      // Auto-connect logic
      if (type === 'frontend') {
        const backendNode = updatedNodes.find(node => node.type === 'backend');
        if (backendNode) {
          const newEdge: Edge = {
            id: `edge-${newNode.id}-${backendNode.id}`,
            source: newNode.id,
            target: backendNode.id,
            style: { stroke: '#007bff', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: 'arrowclosed', color: '#007bff' },
          };
          setEdges((eds) => [...eds, newEdge]);
          toast.info('Auto-connected Frontend to Backend');
        }
      } else if (type === 'backend') {
        const frontendNode = updatedNodes.find(node => node.type === 'frontend');
        const databaseNode = updatedNodes.find(node => node.type === 'database');
        
        if (frontendNode) {
          const newEdge: Edge = {
            id: `edge-${frontendNode.id}-${newNode.id}`,
            source: frontendNode.id,
            target: newNode.id,
            style: { stroke: '#007bff', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: 'arrowclosed', color: '#007bff' },
          };
          setEdges((eds) => [...eds, newEdge]);
        }
        
        if (databaseNode) {
          const newEdge: Edge = {
            id: `edge-${newNode.id}-${databaseNode.id}`,
            source: newNode.id,
            target: databaseNode.id,
            style: { stroke: '#007bff', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: 'arrowclosed', color: '#007bff' },
          };
          setEdges((eds) => [...eds, newEdge]);
        }
        
        if (frontendNode || databaseNode) {
          toast.info('Auto-connected Backend to Frontend and Database');
        }
      } else if (type === 'database') {
        const backendNode = updatedNodes.find(node => node.type === 'backend');
        if (backendNode) {
          const newEdge: Edge = {
            id: `edge-${backendNode.id}-${newNode.id}`,
            source: backendNode.id,
            target: newNode.id,
            style: { stroke: '#007bff', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: 'arrowclosed', color: '#007bff' },
          };
          setEdges((eds) => [...eds, newEdge]);
          toast.info('Auto-connected Backend to Database');
        }
      }
      
      return updatedNodes;
    });
  };

  const handleStartDeployment = () => {
    if (nodes.length === 0) {
      toast.warning('No nodes to deploy', {
        description: 'Please add some components to your deployment flow first',
        duration: 3000,
      });
      return;
    }

    setIsRunning(true);
    toast.info('Deployment started', {
      description: `Starting deployment of ${nodes.length} components`,
      duration: 3000,
    });
    
    // Simulate deployment progress
    let currentStep = 0;
    const steps = nodes.map(node => node.id);
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === steps[currentStep]) {
              return { ...node, data: { ...node.data, status: 'running' } };
            }
            if (currentStep > 0 && node.id === steps[currentStep - 1]) {
              return { ...node, data: { ...node.data, status: 'success' } };
            }
            return node;
          })
        );
        currentStep++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        toast.success('Deployment completed!', {
          description: `Successfully deployed ${nodes.length} components`,
          duration: 4000,
        });
      }
    }, 2000);
  };

  const handleResetDeployment = () => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, status: 'pending' },
      }))
    );
    setIsRunning(false);
    setSelectedNode(null);
    toast.info('Deployment reset', {
      description: 'All nodes have been reset to pending status',
      duration: 3000,
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNode(node)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        
        <Panel position="top-left">
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            minWidth: '200px'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>Components</h3>
            <button
              onClick={() => addNode('frontend', 'Frontend', { framework: 'React' })}
              style={{
                padding: '0.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🌐 Frontend
            </button>
            <button
              onClick={() => addNode('backend', 'Backend', { framework: 'Node.js' })}
              style={{
                padding: '0.5rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ⚙️ Backend
            </button>
            <button
              onClick={() => addNode('database', 'Database', { databaseType: 'PostgreSQL' })}
              style={{
                padding: '0.5rem',
                background: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🗄️ Database
            </button>
            <button
              onClick={() => addNode('devops', 'DevOps', { tool: 'Docker' })}
              style={{
                padding: '0.5rem',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🔧 DevOps
            </button>
            <button
              onClick={() => addNode('server', 'Server', { provider: 'AWS' })}
              style={{
                padding: '0.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              🖥️ Server
            </button>
          </div>
        </Panel>

        <Panel position="top-right">
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={handleStartDeployment}
              disabled={isRunning || nodes.length === 0}
              style={{
                padding: '0.5rem 1rem',
                background: isRunning ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {isRunning ? 'Running...' : 'Start Deployment'}
            </button>
            <button
              onClick={handleResetDeployment}
              style={{
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Reset
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '0.5rem 1rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ← Dashboard
            </button>
          </div>
        </Panel>

        {selectedNode && (
          <Panel position="bottom-right">
            <div style={{ 
              background: 'white', 
              padding: '1rem', 
              borderRadius: '8px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minWidth: '250px'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#333' }}>
                {selectedNode.data.label} Properties
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#666' }}>Framework/Tool</label>
                  <input
                    type="text"
                    value={selectedNode.data.framework || selectedNode.data.databaseType || selectedNode.data.tool || selectedNode.data.provider || ''}
                    onChange={(e) => {
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === selectedNode.id
                            ? {
                                ...node,
                                data: {
                                  ...node.data,
                                  framework: e.target.value,
                                  databaseType: e.target.value,
                                  tool: e.target.value,
                                  provider: e.target.value,
                                },
                              }
                            : node
                        )
                      );
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#666' }}>Description</label>
                  <textarea
                    value={selectedNode.data.description || ''}
                    onChange={(e) => {
                      setNodes((nds) =>
                        nds.map((node) =>
                          node.id === selectedNode.id
                            ? { ...node, data: { ...node.data, description: e.target.value } }
                            : node
                        )
                      );
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      minHeight: '60px'
                    }}
                  />
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export const ReactFlowDeploymentWithProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <ReactFlowDeployment />
    </ReactFlowProvider>
  );
};
