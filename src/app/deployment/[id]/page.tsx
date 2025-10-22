'use client';

import { DeploymentFlowComponent } from '../../../components/deployment/DeploymentFlow';
import { useParams } from 'next/navigation';

export default function DeploymentPage() {
  const params = useParams();
  const deploymentId = params.id as string;

  return <DeploymentFlowComponent deploymentId={deploymentId} />;
}
