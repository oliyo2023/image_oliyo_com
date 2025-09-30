// src/app/dashboard/edit-image/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditImage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen-image-edit');
  const [strength, setStrength] = useState(0.5);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 52428800) {
        setMessage('File size exceeds 50MB limit.');
        return;
      }

      setSelectedImage(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setMessage('Please select an image to edit.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // First, upload the image to get an identifier
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      // For simplicity, we'll simulate the process here
      // In a real implementation, you would upload the image first
      
      // Then send the edit request
      const response = await fetch('/api/images/edit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          strength,
          // In a real implementation, you would include the image identifier here
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Image editing initiated! Check back later to view your edited image.');
        // Reset form
        setPrompt('');
        setSelectedImage(null);
        setPreviewUrl('');
      } else {
        setMessage(data.message || 'Failed to edit image');
      }
    } catch (error) {
      setMessage('An error occurred while editing the image');
      console.error('Error editing image:', error);
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
            Edit Image
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
            Modify Existing Image
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
                  <label htmlFor="image" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Upload Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 50MB
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="prompt" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Edit Prompt
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.25rem',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Describe how you want to modify the image..."
                  />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    Example: "Make the sky more blue and add clouds"
                  </p>
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

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="strength" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Strength: {Math.round(strength * 100)}%
                  </label>
                  <input
                    type="range"
                    id="strength"
                    min="0"
                    max="1"
                    step="0.01"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    style={{
                      width: '100%'
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    <span>Subtle Changes</span>
                    <span>Moderate Changes</span>
                    <span>Dramatic Changes</span>
                  </div>
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
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Editing...' : 'Edit Image'}
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
                Image Preview
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
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      objectFit: 'contain' 
                    }} 
                  />
                ) : (
                  <p style={{ color: '#6b7280' }}>
                    {selectedImage ? 'Preview will appear here' : 'Upload an image to see preview'}
                  </p>
                )}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  <strong>Tip:</strong> Be specific with your edit prompts. 
                  For example: "Change the background to a beach scene" or "Add a hat to the person"
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}