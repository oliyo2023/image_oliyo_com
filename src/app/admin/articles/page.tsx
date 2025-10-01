// src/app/admin/articles/page.tsx
// Admin Articles Management Page

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface Article {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    email: string;
  };
  publicationDate: string;
  status: string;
  imageUrl?: string;
}

export default function AdminArticles() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    status: 'draft',
    imageUrl: ''
  });
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user profile
    fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.id) {
        setUser(data);
        // Check if user has admin role
        if (data.role !== 'admin') {
          // Redirect non-admin users
          router.push('/dashboard');
        } else {
          // Fetch articles after confirming admin access
          fetchArticles();
        }
      } else {
        // Invalid token, redirect to login
        localStorage.removeItem('token');
        router.push('/login');
      }
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      router.push('/login');
      setLoading(false);
    });
  }, [router]);

  const fetchArticles = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/admin/articles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setArticles(data.articles || []);
      } else {
        setError(data.message || 'Failed to fetch articles');
      }
    } catch (err) {
      setError('Error fetching articles');
      console.error(err);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newArticle)
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Article created successfully');
        setNewArticle({ title: '', content: '', status: 'draft', imageUrl: '' });
        fetchArticles(); // Refresh the list
      } else {
        setError(data.message || 'Failed to create article');
      }
    } catch (err) {
      setError('Error creating article');
      console.error(err);
    }
  };

  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/admin/articles/${editingArticle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingArticle.title,
          content: editingArticle.content,
          status: editingArticle.status,
          imageUrl: editingArticle.imageUrl
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Article updated successfully');
        setEditingArticle(null);
        fetchArticles(); // Refresh the list
      } else {
        setError(data.message || 'Failed to update article');
      }
    } catch (err) {
      setError('Error updating article');
      console.error(err);
    }
  };

  const handleEditClick = (article: Article) => {
    setEditingArticle(article);
    setSuccess('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingArticle(null);
    setSuccess('');
    setError('');
  };

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(() => {
      localStorage.removeItem('token');
      router.push('/login');
    });
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Navigation */}
      <Navigation user={user} onLogout={handleLogout} />

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
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Manage Articles
          </h2>
          
          {error && (
            <div style={{ 
              backgroundColor: '#fee2e2', 
              color: '#7f1d1d', 
              padding: '0.75rem', 
              borderRadius: '0.25rem', 
              marginBottom: '1rem' 
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              backgroundColor: '#dcfce7', 
              color: '#166534', 
              padding: '0.75rem', 
              borderRadius: '0.25rem', 
              marginBottom: '1rem' 
            }}>
              {success}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            {/* Create Article Form */}
            <div style={{ 
              flex: '1', 
              backgroundColor: '#f9fafb', 
              padding: '1.5rem', 
              borderRadius: '0.5rem', 
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                {editingArticle ? 'Edit Article' : 'Create New Article'}
              </h3>
              
              <form onSubmit={editingArticle ? handleUpdateArticle : handleCreateArticle}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingArticle ? editingArticle.title : newArticle.title}
                    onChange={(e) => 
                      editingArticle 
                        ? setEditingArticle({...editingArticle, title: e.target.value}) 
                        : setNewArticle({...newArticle, title: e.target.value})
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem'
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Content
                  </label>
                  <textarea
                    value={editingArticle ? editingArticle.content : newArticle.content}
                    onChange={(e) => 
                      editingArticle 
                        ? setEditingArticle({...editingArticle, content: e.target.value}) 
                        : setNewArticle({...newArticle, content: e.target.value})
                    }
                    style={{
                      width: '100%',
                      height: '120px',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem'
                    }}
                    required
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Status
                  </label>
                  <select
                    value={editingArticle ? editingArticle.status : newArticle.status}
                    onChange={(e) => 
                      editingArticle 
                        ? setEditingArticle({...editingArticle, status: e.target.value}) 
                        : setNewArticle({...newArticle, status: e.target.value})
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem'
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingArticle ? editingArticle.imageUrl || '' : newArticle.imageUrl}
                    onChange={(e) => 
                      editingArticle 
                        ? setEditingArticle({...editingArticle, imageUrl: e.target.value || null}) 
                        : setNewArticle({...newArticle, imageUrl: e.target.value})
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {editingArticle ? (
                    <>
                      <button
                        type="submit"
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        Update Article
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#9ca3af',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="submit"
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      Create Article
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Articles List */}
            <div style={{ flex: '2' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Articles
              </h3>
              
              {articles.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No articles found.</p>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem' 
                }}>
                  {articles.map(article => (
                    <div 
                      key={article.id}
                      style={{ 
                        backgroundColor: '#f9fafb', 
                        padding: '1rem', 
                        borderRadius: '0.5rem', 
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>
                            {article.title}
                          </h4>
                          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            By {article.author.email} on {new Date(article.publicationDate).toLocaleDateString()}
                          </p>
                          <span 
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              backgroundColor: 
                                article.status === 'published' ? '#dcfce7' : 
                                article.status === 'draft' ? '#fef3c7' : 
                                '#fee2e2',
                              color: 
                                article.status === 'published' ? '#166534' : 
                                article.status === 'draft' ? '#92400e' : 
                                '#7f1d1d'
                            }}
                          >
                            {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEditClick(article)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.25rem',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.5rem', color: '#4b5563', lineHeight: '1.5' }}>
                        {article.content.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}