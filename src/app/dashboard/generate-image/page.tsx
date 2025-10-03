// src/app/dashboard/generate-image/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  creditBalance: number;
  registrationDate: string;
  lastLogin: string;
  socialLoginProvider?: string;
}

export default function GenerateImage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen-image-edit');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [style, setStyle] = useState('realistic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
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
      } else {
        // Invalid token, redirect to login
        localStorage.removeItem('token');
        router.push('/login');
      }
    })
    .catch(error => {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          width,
          height,
          style
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Image generation initiated! Check back later to view your generated image.');
        // Reset form
        setPrompt('');
      } else {
        setMessage(data.message || 'Failed to generate image');
      }
    } catch (error) {
      setMessage('An error occurred while generating the image');
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (!user) {
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
            Generate Image
          </h1>
          <button 
            onClick={handleBack}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
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
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Create New Image
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {/* Form */}
            <div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="prompt" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Prompt
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Describe the image you want to generate..."
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="model" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    AI Model
                  </label>
                  <select
                    id="model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="qwen-image-edit">Qwen Image Edit (5 credits)</option>
                    <option value="gemini-flash-image">Gemini Flash Image (3 credits)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="width" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Width
                    </label>
                    <input
                      type="number"
                      id="width"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value))}
                      min="64"
                      max="2048"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="height" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Height
                    </label>
                    <input
                      type="number"
                      id="height"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value))}
                      min="64"
                      max="2048"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.25rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="style" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Style
                  </label>
                  <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="realistic">Realistic</option>
                    <option value="anime">Anime</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="painting">Painting</option>
                    <option value="digital-art">Digital Art</option>
                  </select>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '2rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Cost:</span> 
                    <span style={{ marginLeft: '0.5rem' }}>
                      {selectedModel === 'qwen-image-edit' ? '5' : '3'} credits
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Balance:</span> 
                    <span style={{ marginLeft: '0.5rem' }}>{user.creditBalance} credits</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Image'}
                </button>
              </form>

              {message && (
                <div 
                  style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: message.includes('initiated') ? '#d1fae5' : '#fee2e2', 
                    color: message.includes('initiated') ? '#065f46' : '#991b1b', 
                    borderRadius: '0.25rem',
                    textAlign: 'center'
                  }}
                >
                  {message}
                </div>
              )}
            </div>

            {/* Preview */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                Preview
              </h3>
              <div style={{ 
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #d1d5db'
              }}>
                <p style={{ color: '#6b7280' }}>
                  {prompt ? 'Preview will appear here' : 'Enter a prompt to see preview'}
                </p>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Tip:</strong> Be descriptive with your prompts for better results. 
                  For example: "A beautiful landscape with mountains and a lake at sunset, realistic style"
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}