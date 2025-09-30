// src/app/docs/page.tsx
export default function Docs() {
  const apiEndpoints = [
    {
      category: 'Authentication',
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Register a new user account',
          auth: 'None'
        },
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Authenticate user and create session',
          auth: 'None'
        },
        {
          method: 'POST',
          path: '/api/auth/login/social',
          description: 'Authenticate user via social provider',
          auth: 'None'
        },
        {
          method: 'GET',
          path: '/api/auth/profile',
          description: 'Get authenticated user profile',
          auth: 'Bearer Token'
        },
        {
          method: 'POST',
          path: '/api/auth/logout',
          description: 'Logout user and invalidate session',
          auth: 'Bearer Token'
        }
      ]
    },
    {
      category: 'Image Operations',
      endpoints: [
        {
          method: 'POST',
          path: '/api/images/generate',
          description: 'Generate a new image from a text prompt using an AI model',
          auth: 'Bearer Token'
        },
        {
          method: 'POST',
          path: '/api/images/edit',
          description: 'Edit an existing image using a text prompt',
          auth: 'Bearer Token'
        },
        {
          method: 'GET',
          path: '/api/images',
          description: 'Get list of user\'s generated and edited images',
          auth: 'Bearer Token'
        },
        {
          method: 'GET',
          path: '/api/images/{id}',
          description: 'Get details of a specific image',
          auth: 'Bearer Token'
        }
      ]
    },
    {
      category: 'Credit Management',
      endpoints: [
        {
          method: 'GET',
          path: '/api/credits/balance',
          description: 'Get the authenticated user\'s current credit balance',
          auth: 'Bearer Token'
        },
        {
          method: 'GET',
          path: '/api/credits/transactions',
          description: 'Get the authenticated user\'s credit transaction history',
          auth: 'Bearer Token'
        },
        {
          method: 'POST',
          path: '/api/credits/purchase-intent',
          description: 'Create a payment intent for credit purchase',
          auth: 'Bearer Token'
        },
        {
          method: 'POST',
          path: '/api/credits/purchase-confirm',
          description: 'Confirm a payment and update user\'s credit balance',
          auth: 'Bearer Token'
        }
      ]
    },
    {
      category: 'Admin',
      endpoints: [
        {
          method: 'GET',
          path: '/api/admin/users',
          description: 'Get list of all users with basic information',
          auth: 'Bearer Token (Admin)'
        },
        {
          method: 'GET',
          path: '/api/admin/analytics',
          description: 'Get platform usage analytics',
          auth: 'Bearer Token (Admin)'
        },
        {
          method: 'GET',
          path: '/api/admin/transactions',
          description: 'Get all credit transactions for audit purposes',
          auth: 'Bearer Token (Admin)'
        },
        {
          method: 'POST',
          path: '/api/admin/articles',
          description: 'Create a new article or example',
          auth: 'Bearer Token (Admin)'
        },
        {
          method: 'GET',
          path: '/api/admin/articles',
          description: 'Get all articles',
          auth: 'Bearer Token (Admin)'
        },
        {
          method: 'PUT',
          path: '/api/admin/articles/{id}',
          description: 'Update an existing article',
          auth: 'Bearer Token (Admin)'
        }
      ]
    }
  ];

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
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '3rem'
          }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              API Documentation
            </h1>
            <p style={{ color: '#4b5563', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
              Comprehensive documentation for all API endpoints in the Oliyo AI Image Generation and Editing Platform
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '300px 1fr', 
            gap: '2rem'
          }}>
            {/* Sidebar Navigation */}
            <div style={{ 
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                API Categories
              </h2>
              
              <ul style={{ 
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {apiEndpoints.map((category, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <a
                      href={`#${category.category.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{ 
                        color: '#2563eb', 
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      {category.category}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div style={{ 
                marginTop: '2rem',
                padding: '1rem', 
                backgroundColor: '#fffbeb', 
                borderRadius: '0.5rem',
                border: '1px solid #fbbf24'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
                  Authentication
                </h3>
                <p style={{ color: '#92400e', fontSize: '0.875rem' }}>
                  All authenticated endpoints require a valid JWT token in the Authorization header:
                </p>
                <pre style={{ 
                  backgroundColor: '#fef3c7', 
                  padding: '0.5rem', 
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  overflowX: 'auto'
                }}>
                  Authorization: Bearer {'<'}jwt_token{'>'}
                </pre>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div>
              <div style={{ 
                padding: '1.5rem', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '0.5rem',
                border: '1px solid #bae6fd',
                marginBottom: '2rem'
              }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '0.5rem' }}>
                  Base URL
                </h2>
                <p style={{ color: '#0c4a6e' }}>
                  <code>https://your-domain.com/api</code>
                </p>
                <p style={{ color: '#0c4a6e', marginTop: '0.5rem' }}>
                  All API requests must use HTTPS for security.
                </p>
              </div>
              
              {apiEndpoints.map((category, categoryIndex) => (
                <div 
                  key={categoryIndex}
                  id={category.category.toLowerCase().replace(/\s+/g, '-')}
                  style={{ 
                    marginBottom: '3rem'
                  }}
                >
                  <h2 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 'bold', 
                    color: '#1f2937', 
                    marginBottom: '1.5rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    {category.category}
                  </h2>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem'
                  }}>
                    {category.endpoints.map((endpoint, endpointIndex) => (
                      <div 
                        key={endpointIndex}
                        style={{ 
                          backgroundColor: 'white',
                          borderRadius: '0.5rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          border: '1px solid #e5e7eb',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ 
                          padding: '1rem 1.5rem',
                          backgroundColor: '#f9fafb',
                          borderBottom: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ 
                              padding: '0.25rem 0.5rem',
                              backgroundColor: endpoint.method === 'GET' ? '#dbeafe' : 
                                            endpoint.method === 'POST' ? '#dcfce7' : 
                                            endpoint.method === 'PUT' ? '#fffbeb' : '#fee2e2',
                              color: endpoint.method === 'GET' ? '#2563eb' : 
                                   endpoint.method === 'POST' ? '#10b981' : 
                                   endpoint.method === 'PUT' ? '#f59e0b' : '#ef4444',
                              fontWeight: 'bold',
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem'
                            }}>
                              {endpoint.method}
                            </span>
                            <code style={{ 
                              fontSize: '1rem', 
                              fontWeight: 'bold', 
                              color: '#1f2937' 
                            }}>
                              {endpoint.path}
                            </code>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {endpoint.auth !== 'None' && (
                              <span style={{ 
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#f3e8ff',
                                color: '#7c3aed',
                                fontWeight: 'bold',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem'
                              }}>
                                {endpoint.auth}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ padding: '1.5rem' }}>
                          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                            {endpoint.description}
                          </p>
                          
                          <div style={{ 
                            padding: '1rem', 
                            backgroundColor: '#f0fdf4', 
                            borderRadius: '0.5rem',
                            border: '1px solid #bbf7d0'
                          }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#14532d', marginBottom: '0.5rem' }}>
                              Request Example
                            </h3>
                            <pre style={{ 
                              backgroundColor: '#dcfce7', 
                              padding: '0.75rem', 
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem',
                              overflowX: 'auto',
                              color: '#14532d'
                            }}>
                              curl -X {endpoint.method} \{'\n'}
                              {'  '}https://your-domain.com{endpoint.path} \{'\n'}
                              {'  '}-H "Content-Type: application/json"{'\n'}
                              {endpoint.auth !== 'None' ? '  -H "Authorization: Bearer <jwt_token>" \\\n' : ''}
                              {'  '}{'-d \"{\n'}
                              {'    '}"key": "value"\n
                              {'  '}{'  }"'}'
                            </pre>
                          </div>
                          
                          <div style={{ 
                            marginTop: '1rem',
                            padding: '1rem', 
                            backgroundColor: '#f0f9ff', 
                            borderRadius: '0.5rem',
                            border: '1px solid #bae6fd'
                          }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '0.5rem' }}>
                              Success Response (200 OK)
                            </h3>
                            <pre style={{ 
                              backgroundColor: '#e0f2fe', 
                              padding: '0.75rem', 
                              borderRadius: '0.25rem',
                              fontSize: '0.875rem',
                              overflowX: 'auto',
                              color: '#0c4a6e'
                            }}>
                              {'{'}\n
                              {'  '}"success": true,\n
                              {'  '}"message": "Operation completed successfully",\n
                              {'  '}"data": '{' /* Response data */ '}'\n
                              '}'
                            </pre>
                          </div>
                          
                          <div style={{ 
                            marginTop: '1rem',
                            padding: '1rem', 
                            backgroundColor: '#fef2f2', 
                            borderRadius: '0.5rem',
                            border: '1px solid #fecaca'
                          }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#7f1d1d', marginBottom: '0.5rem' }}>
                              Error Responses
                            </h3>
                            <ul style={{ 
                              listStyle: 'none',
                              padding: 0,
                              margin: 0,
                              color: '#7f1d1d'
                            }}>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>400:</strong> Invalid input (malformed JSON, missing required fields, etc.)
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>401:</strong> Unauthorized (invalid/expired token)
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>403:</strong> Forbidden (insufficient permissions)
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>404:</strong> Not found (resource doesn't exist)
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>429:</strong> Too many requests (rate limit exceeded)
                              </li>
                              <li>
                                <strong>500:</strong> Internal server error (unexpected error occurred)
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
            <a href="/pricing" style={{ color: '#6b7280', textDecoration: 'none' }}>Pricing</a>
            <a href="/faq" style={{ color: '#6b7280', textDecoration: 'none' }}>FAQ</a>
            <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ color: '#4b5563' }}>
            © {new Date().getFullYear()} Oliyo AI Image Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}