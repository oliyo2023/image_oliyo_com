// src/app/about/page.tsx
export default function About() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1rem 2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Oliyo AI Image Platform
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href="/"
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#e5e7eb', 
                color: '#1f2937', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                textDecoration: 'none'
              }}
            >
              Home
            </a>
            <a
              href="/login"
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                textDecoration: 'none'
              }}
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '2rem auto',
        padding: '0 1rem'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            About Us
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Our Vision
              </h2>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                At Oliyo AI Image Platform, we believe that everyone deserves to bring their creative visions to life. 
                Our mission is to democratize access to powerful AI image generation and editing tools, making professional-level 
                creative resources available to individuals, artists, designers, and businesses of all sizes.
              </p>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginTop: '1rem' }}>
                We're building a platform where imagination meets technology, enabling users to transform simple text 
                prompts into stunning visuals in seconds.
              </p>
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Our Technology
              </h2>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                We leverage cutting-edge artificial intelligence models including qwen-image-edit and gemini-flash-image 
                to provide unparalleled image generation and editing capabilities. Our platform is built with performance, 
                security, and ease of use in mind.
              </p>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginTop: '1rem' }}>
                Our cloud-based infrastructure ensures fast processing times and scalable performance to handle your 
                creative demands, whether you're generating a single image or bulk processing hundreds.
              </p>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '3rem', 
            padding: '2rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem' 
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              How It Works
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>1</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Sign Up
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    Create your account and receive 100 free credits to get started.
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>2</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Describe Your Vision
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    Enter a text prompt describing the image you want to create or edit.
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>3</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Generate or Edit
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    Our AI models create or modify your image based on your prompt.
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>4</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Enjoy Your Creations
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    Download, share, or continue editing your generated images.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '3rem',
            textAlign: 'center',
            backgroundColor: '#2563eb',
            padding: '3rem',
            borderRadius: '0.5rem',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Ready to Start Creating?
            </h2>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Join thousands of creators who are bringing their ideas to life with our AI-powered platform.
            </p>
            <div>
              <a
                href="/register"
                style={{ 
                  padding: '1rem 2rem', 
                  backgroundColor: 'white', 
                  color: '#2563eb', 
                  fontWeight: 'bold', 
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontSize: '1.125rem'
                }}
              >
                Get Started Now - 100 Free Credits
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ 
        width: '100%', 
        padding: '2rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        marginTop: 'auto'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</a>
            <a href="/about" style={{ color: '#6b7280', textDecoration: 'none' }}>About</a>
            <a href="#" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ color: '#4b5563' }}>
            © {new Date().getFullYear()} Oliyo AI Image Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}