'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeploymentPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if no deployment ID is provided
    router.push('/dashboard');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h2>Redirecting to Dashboard...</h2>
      <p>Deployment pages require a specific deployment ID.</p>
    </div>
  );
}