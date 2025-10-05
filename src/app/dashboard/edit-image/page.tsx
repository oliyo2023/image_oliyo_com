// src/app/dashboard/edit-image/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface UserProfile {
  id: string;
  email: string;
  creditBalance: number;
  registrationDate: string;
  lastLogin: string;
  socialLoginProvider?: string;
}

export default function EditImage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen-image-edit');
  const [strength, setStrength] = useState(0.5);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('EditImage');
  const tc = useTranslations('Common');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }

    fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser(data);
        } else {
          localStorage.removeItem('token');
          router.push(`/${locale}/login`);
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
        router.push(`/${locale}/login`);
      });
  }, [router, locale]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage(t('messages.invalidType'));
      return;
    }

    if (file.size > 52428800) {
      setMessage(t('messages.tooLarge'));
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMessage('');
  };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!selectedImage) {
     setMessage(t('messages.noImage'));
     return;
   }

   setLoading(true);
   setMessage('');

   try {
     const token = localStorage.getItem('token');

     // First, upload the image
     const formData = new FormData();
     formData.append('image', selectedImage);

     const uploadResponse = await fetch('/api/images/upload', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`
       },
       body: formData
     });

     const uploadData = await uploadResponse.json();

     if (!uploadResponse.ok) {
       setMessage(uploadData.message || t('messages.uploadFailed'));
       return;
     }

     // Then, edit the uploaded image
     const editResponse = await fetch('/api/images/edit', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         prompt,
         model: selectedModel,
         strength,
         originalImageId: uploadData.imageId
       })
     });

     const editData = await editResponse.json();

     if (editResponse.ok) {
       setMessage(t('messages.initiated'));
       setPrompt('');
       setSelectedImage(null);
       setPreviewUrl('');
     } else {
       setMessage(editData.message || t('messages.failed'));
     }
   } catch (error) {
     setMessage(t('messages.error'));
     console.error('Error editing image:', error);
   } finally {
     setLoading(false);
   }
 };

  const handleBack = () => {
    router.push(`/${locale}/dashboard`);
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
        <p>{tc('loading')}</p>
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
            {t('title')}
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
            {t('backToDashboard')}
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
            {t('modifyExistingImage')}
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
                    {t('uploadImage')}
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
                    {t('supportedFormats')}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="prompt" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {t('editPrompt')}
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
                    placeholder={t('editPromptPlaceholder')}
                  />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {t('editPromptExample')}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="model" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {t('aiModel')}
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
                    <option value="qwen-image-edit">Qwen Image Edit (10 {t('credits')})</option>
                    <option value="gemini-flash-image">Gemini Flash Image (30 {t('credits')})</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="strength" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {t('strength')}: {Math.round(strength * 100)}%
                  </label>
                  <input
                    type="range"
                    id="strength"
                    min={0}
                    max={1}
                    step={0.01}
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    <span>{t('strengthScale.subtle')}</span>
                    <span>{t('strengthScale.moderate')}</span>
                    <span>{t('strengthScale.dramatic')}</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '2rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{t('cost')}:</span>
                    <span style={{ marginLeft: '0.5rem' }}>
                      {selectedModel === 'qwen-image-edit' ? '10' : '30'} {t('credits')}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{t('balance')}:</span>
                    <span style={{ marginLeft: '0.5rem' }}>{user.creditBalance} {t('credits')}</span>
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
                  {loading ? t('editing') : t('edit')}
                </button>
              </form>

              {message && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: message.includes('initiated') || message.includes('开始') ? '#d1fae5' : '#fee2e2',
                    color: message.includes('initiated') || message.includes('开始') ? '#065f46' : '#991b1b',
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
                {t('imagePreview')}
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
                    {selectedImage ? t('imagePreview') : t('uploadImage')}
                  </p>
                )}
              </div>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {t('tips')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}