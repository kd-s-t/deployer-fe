export interface Node {
  id: string;
  type: 'frontend' | 'backend' | 'database' | 'repository' | 'cicd' | 'server' | 'optional';
  x: number;
  y: number;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  toolType?: string; // For optional tools, store the specific tool type
}

export interface Connection {
  id: string;
  from: string;
  to: string;
}

export interface MenuCard {
  id: string;
  type: 'frontend' | 'backend' | 'database' | 'repository' | 'cicd' | 'server' | 'optional';
  label: string;
  icon: string;
  color: string;
  toolType?: string; // For optional tools, store the specific tool type
}

export interface NodeProperties {
  framework?: string;
  styling?: string;
  stateManagement?: string;
  auth?: string;
  databaseType?: string;
  connectionString?: string;
  projectName?: string;
  description?: string;
}

export interface DeploymentFlow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  nodes: Node[];
  connections: Connection[];
  nodeProperties: Record<string, NodeProperties>;
  deploymentConfig: {
    environment: string;
    region: string;
    autoDeploy: boolean;
    notifications: boolean;
  };
  metadata: {
    totalNodes: number;
    completedNodes: number;
    lastDeployment: string | null;
  };
}

export interface MapTransform {
  x: number;
  y: number;
  scale: number;
}
