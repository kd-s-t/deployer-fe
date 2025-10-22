'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '../../lib/config';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleNewDeployment = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if we have valid authentication data
      if (!token) {
        console.error('No authentication token found');
        router.push('/login');
        return;
      }
      
      if (!userData.id) {
        console.error('No user ID found in user data:', userData);
        router.push('/login');
        return;
      }
      
      console.log('Creating deployment with user ID:', userData.id);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'None');
      console.log('User data:', userData);
      
      // Create a new draft deployment
      const response = await fetch(getApiUrl('/deployment'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Temporarily disabled
        },
        body: JSON.stringify({
          name: `New Deployment ${new Date().toLocaleDateString()}`,
          description: 'Draft deployment - ready to configure',
          status: 'draft',
          nodes: [],
          connections: []
        })
      });

      if (response.ok) {
        const newDeployment = await response.json();
        console.log('Successfully created deployment:', newDeployment);
        // Navigate to deployment page with the new deployment ID
        router.push(`/deployment/${newDeployment.id}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create new deployment:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        // Show error message instead of redirecting
        alert('Failed to create deployment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating new deployment:', error);
      // Show error message instead of redirecting
      alert('Error creating deployment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f4f7f6'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🚀 Deployer Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {user?.name || user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Welcome Section */}
          <section style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: '#333', marginBottom: '1rem' }}>
              Welcome to your Deployer Dashboard! 🎉
            </h2>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              You have successfully logged in as <strong>{user?.email}</strong>
            </p>
            {user?.name && (
              <p style={{ color: '#666' }}>
                Full Name: <strong>{user.name}</strong>
              </p>
            )}
            {user?.githubUsername && (
              <p style={{ color: '#666' }}>
                GitHub: <strong>@{user.githubUsername}</strong>
              </p>
            )}
          </section>

          {/* Quick Actions */}
          <section style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#333', marginBottom: '1.5rem' }}>Quick Actions</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <button 
                onClick={handleNewDeployment}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>🚀</span> New Deployment
              </button>
              <button style={{
                padding: '1.5rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>📊</span> View Deployments
              </button>
              <button style={{
                padding: '1.5rem',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⚙️</span> Settings
              </button>
            </div>
          </section>

          {/* Recent Activity */}
          <section style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '1.5rem' }}>Recent Activity</h3>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <p style={{ color: '#666', margin: 0 }}>
                No recent activity. Start by creating your first deployment!
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
