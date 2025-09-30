// src/app/blog/page.tsx
export default function Blog() {
  // Sample blog posts data
  const blogPosts = [
    {
      id: '1',
      title: 'Getting Started with AI Image Generation',
      excerpt: 'Learn the basics of creating stunning images with AI models and text prompts.',
      author: 'Alex Johnson',
      date: '2025-09-15',
      readTime: '5 min read',
      image: '/images/blog-1.jpg'
    },
    {
      id: '2',
      title: 'Advanced Techniques for Image Editing',
      excerpt: 'Discover professional tips and tricks for editing your images with AI.',
      author: 'Sarah Chen',
      date: '2025-09-10',
      readTime: '8 min read',
      image: '/images/blog-2.jpg'
    },
    {
      id: '3',
      title: 'Understanding Credit Systems in AI Platforms',
      excerpt: 'How credit-based systems work and how to maximize your value.',
      author: 'Michael Rodriguez',
      date: '2025-09-05',
      readTime: '6 min read',
      image: '/images/blog-3.jpg'
    },
    {
      id: '4',
      title: 'Case Study: Creating a Fantasy Landscape',
      excerpt: 'Walkthrough of creating a fantasy landscape from concept to final image.',
      author: 'Emma Wilson',
      date: '2025-08-28',
      readTime: '12 min read',
      image: '/images/blog-4.jpg'
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
              Blog & Resources
            </h1>
            <p style={{ color: '#4b5563', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
              Tips, tutorials, and inspiration for creating amazing AI-generated images
            </p>
          </div>
          
          {/* Featured Post */}
          <div style={{ 
            marginBottom: '3rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '2rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '2rem'
            }}>
              <div>
                <div style={{ 
                  backgroundColor: '#e5e7eb',
                  height: '300px',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#4b5563' }}>Featured Image</span>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center'
              }}>
                <div style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  Featured
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                  Mastering AI Image Generation: A Complete Guide
                </h2>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Learn everything you need to know about creating stunning AI-generated images, 
                  from basic prompts to advanced techniques that will take your creations to the next level.
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: '#dbeafe', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: '#2563eb', fontWeight: 'bold' }}>AJ</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                        Alex Johnson
                      </p>
                      <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: 0 }}>
                        September 20, 2025 · 10 min read
                      </p>
                    </div>
                  </div>
                  <a
                    href="/blog/mastering-ai-image-generation"
                    style={{ 
                      padding: '0.5rem 1rem', 
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      fontWeight: 'bold', 
                      borderRadius: '0.25rem',
                      textDecoration: 'none'
                    }}
                  >
                    Read Article
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Blog Posts Grid */}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
              Latest Articles
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem'
            }}>
              {blogPosts.map((post) => (
                <div 
                  key={post.id}
                  style={{ 
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    backgroundColor: '#e5e7eb',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#4b5563' }}>Blog Image</span>
                  </div>
                  
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                      {post.title}
                    </h3>
                    
                    <p style={{ color: '#4b5563', marginBottom: '1rem', lineHeight: '1.5' }}>
                      {post.excerpt}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginTop: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          backgroundColor: '#dbeafe', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.75rem' }}>
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.875rem', margin: 0 }}>
                            {post.author}
                          </p>
                          <p style={{ color: '#4b5563', fontSize: '0.75rem', margin: 0 }}>
                            {new Date(post.date).toLocaleDateString()} · {post.readTime}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/blog/${post.id}`}
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          backgroundColor: '#2563eb', 
                          color: 'white', 
                          fontWeight: 'bold', 
                          borderRadius: '0.25rem',
                          textDecoration: 'none',
                          fontSize: '0.875rem'
                        }}
                      >
                        Read
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '3rem',
            gap: '0.5rem'
          }}>
            <button
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#e5e7eb', 
                color: '#1f2937', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Previous
            </button>
            <button
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              1
            </button>
            <button
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#e5e7eb', 
                color: '#1f2937', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              2
            </button>
            <button
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#e5e7eb', 
                color: '#1f2937', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              3
            </button>
            <button
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#e5e7eb', 
                color: '#1f2937', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Next
            </button>
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