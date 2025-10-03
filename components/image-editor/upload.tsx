import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';

interface ImageUploadProps {
  onUpload: (file: File) => void;
  allowedFormats?: string[];
  maxFileSize?: number; // in MB
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUpload, 
  allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  maxFileSize = 50 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file format
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension && !allowedFormats.includes(fileExtension)) {
        setError(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`);
        return;
      }
      
      // Validate file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxFileSize) {
        setError(`File size too large. Maximum allowed: ${maxFileSize}MB`);
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    if (onUpload) {
      setIsUploading(true);
      try {
        onUpload(selectedFile);
      } catch (err) {
        setError('Failed to upload image. Please try again.');
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate file format
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension && !allowedFormats.includes(fileExtension)) {
        setError(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`);
        return;
      }
      
      // Validate file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxFileSize) {
        setError(`File size too large. Maximum allowed: ${maxFileSize}MB`);
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-upload-component">
      <form onSubmit={handleSubmit} className="upload-form">
        <div 
          className={`upload-area ${error ? 'error' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={allowedFormats.map(format => `.${format}`).join(',')}
            style={{ display: 'none' }}
          />
          
          {previewUrl && selectedFile ? (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
              <p className="file-info">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
            </div>
          ) : (
            <div className="upload-prompt">
              <p>Drag & drop your image here</p>
              <p>or</p>
              <button type="button" className="browse-button">Browse Files</button>
              <p className="format-info">Supports: {allowedFormats.join(', ')} (Max {maxFileSize}MB)</p>
            </div>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="button-group">
          {selectedFile && (
            <button 
              type="button" 
              className="clear-button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              Clear
            </button>
          )}
          <button 
            type="submit" 
            disabled={!selectedFile || isUploading}
            className="upload-button"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImageUpload;