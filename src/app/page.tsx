export default function HomePage() {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '1rem',
          fontSize: '2.5rem'
        }}>
          🚀 Deployer Agent
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem',
          marginBottom: '2rem'
        }}>
          AI-powered deployment platform for modern applications
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/login" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              Login
            </button>
          </a>
          <button style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: '#007bff',
            border: '2px solid #007bff',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            Learn More
          </button>
        </div>
      </header>

      <main>
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            textAlign: 'center', 
            color: '#333',
            marginBottom: '2rem',
            fontSize: '2rem'
          }}>
            Features
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              padding: '2rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Easy Deployment</h3>
              <p style={{ color: '#666' }}>
                Deploy your applications with just a few clicks using our intuitive interface
              </p>
            </div>
            <div style={{
              padding: '2rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Visual Workflows</h3>
              <p style={{ color: '#666' }}>
                Create and manage complex deployment pipelines with our node-based editor
              </p>
            </div>
            <div style={{
              padding: '2rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>Advanced Configuration</h3>
              <p style={{ color: '#666' }}>
                Fine-tune your deployment settings with powerful configuration options
              </p>
            </div>
          </div>
        </section>

        <section style={{ 
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>Ready to Deploy?</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Start building and deploying your applications today
          </p>
          <button style={{
            padding: '16px 32px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            cursor: 'pointer'
          }}>
            Start Your First Deployment
          </button>
        </section>
      </main>

      <footer style={{ 
        textAlign: 'center', 
        marginTop: '3rem',
        padding: '2rem',
        color: '#666',
        borderTop: '1px solid #ddd'
      }}>
        <p>&copy; 2024 Deployer Agent. All rights reserved.</p>
      </footer>
    </div>
  );
}