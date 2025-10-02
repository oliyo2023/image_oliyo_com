import React, { useState } from 'react';
import ImageUpload from './upload';

interface ImageEditorProps {
  onEdit: (imageId: string, prompt: string, model: string) => void;
  availableModels: Array<{ name: string; cost: number }>;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onEdit, availableModels }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(availableModels[0]?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editResult, setEditResult] = useState<{ id: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    // In a real implementation, this would upload the file to the server
    // and return an image ID. For now, we'll simulate the process.
    console.log('Uploading file:', file.name);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage || !prompt.trim()) {
      setError('Please select an image and enter a prompt');
      return;
    }

    setIsEditing(true);
    setError(null);

    try {
      // In a real implementation, this would call the edit API
      // For now, we'll simulate the process
      console.log(`Editing image with prompt: "${prompt}" using model: ${selectedModel}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // This would be the actual API call:
      // const result = await onEdit(selectedImageId, prompt, selectedModel);
      
      // For demo purposes, we'll simulate a result
      setEditResult({
        id: `edit-${Date.now()}`,
        url: selectedImage // In reality, this would be the edited image URL
      });
    } catch (err) {
      setError('Failed to edit image. Please try again.');
      console.error('Edit error:', err);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="image-editor-component">
      <h2>Image Editor</h2>
      
      <div className="editor-container">
        <div className="upload-section">
          <h3>Upload Image to Edit</h3>
          <ImageUpload 
            onUpload={handleImageUpload}
            allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
            maxFileSize={50}
          />
        </div>
        
        {selectedImage && (
          <div className="editing-section">
            <h3>Edit Image</h3>
            
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="image-preview">
                <img src={selectedImage} alt="To be edited" />
              </div>
              
              <div className="input-group">
                <label htmlFor="prompt">Edit Prompt:</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how you want to edit the image..."
                  rows={4}
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="model">AI Model:</label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {availableModels.map(model => (
                    <option key={model.name} value={model.name}>
                      {model.name} ({model.cost} credits)
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={isEditing} 
                className="edit-button"
              >
                {isEditing ? 'Editing...' : 'Edit Image'}
              </button>
            </form>
          </div>
        )}
        
        {editResult && (
          <div className="result-section">
            <h3>Edited Image</h3>
            <div className="result-content">
              <img src={editResult.url} alt="Edited result" />
              <p>Image ID: {editResult.id}</p>
              <button 
                onClick={() => {
                  setEditResult(null);
                  setPrompt('');
                }}
              >
                Edit Another Image
              </button>
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default ImageEditor;