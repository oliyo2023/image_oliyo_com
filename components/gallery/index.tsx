import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Image {
  id: string;
  originalFilename: string;
  storagePath: string;
  creationDate: Date;
  prompt?: string;
  imageType: 'UPLOADED' | 'GENERATED' | 'EDITED';
  originalImageId?: string;
  modelName?: string;
}

interface GalleryProps {
  userId: string;
  onImageSelect?: (image: Image) => void;
  allowEdit?: boolean;
  allowDelete?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ 
  userId, 
  onImageSelect,
  allowEdit = true,
  allowDelete = true
}) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'uploaded' | 'generated' | 'edited'>('all');

  // Mock image loading - in real implementation, this would fetch from API
  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockImages: Image[] = [
          { 
            id: '1', 
            originalFilename: 'sunset-mountain.png', 
            storagePath: '/images/sunset-mountain.png', 
            creationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
            prompt: 'A beautiful sunset over mountains',
            imageType: 'GENERATED',
            modelName: 'qwen-image-edit'
          },
          { 
            id: '2', 
            originalFilename: 'city-edit.jpg', 
            storagePath: '/images/city-edit.jpg', 
            creationDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
            prompt: 'Add more buildings to the skyline',
            imageType: 'EDITED',
            originalImageId: 'original-city-id',
            modelName: 'gemini-flash-image'
          },
          { 
            id: '3', 
            originalFilename: 'nature-photo.jpg', 
            storagePath: '/images/nature-photo.jpg', 
            creationDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
            imageType: 'UPLOADED'
          },
          { 
            id: '4', 
            originalFilename: 'fantasy-landscape.png', 
            storagePath: '/images/fantasy-landscape.png', 
            creationDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
            prompt: 'Create a fantasy landscape with castles and dragons',
            imageType: 'GENERATED',
            modelName: 'qwen-image-edit'
          },
          { 
            id: '5', 
            originalFilename: 'portrait-edit.jpg', 
            storagePath: '/images/portrait-edit.jpg', 
            creationDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
            prompt: 'Change the background to a beach',
            imageType: 'EDITED',
            originalImageId: 'original-portrait-id',
            modelName: 'gemini-flash-image'
          },
          { 
            id: '6', 
            originalFilename: 'beach-vacation.jpg', 
            storagePath: '/images/beach-vacation.jpg', 
            creationDate: new Date(Date.now() - 7 * 60 * 60 * 1000),
            imageType: 'UPLOADED'
          }
        ];
        
        setImages(mockImages);
      } catch (err) {
        setError('Failed to load images');
        console.error('Gallery loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [userId]);

  const filteredImages = images.filter(image => {
    if (filter === 'all') return true;
    return image.imageType.toLowerCase() === filter;
  });

  const handleImageClick = (image: Image) => {
    setSelectedImage(image.id);
    if (onImageSelect) {
      onImageSelect(image);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      // In real implementation, call API to delete image
      console.log(`Deleting image with ID: ${imageId}`);
      
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      if (selectedImage === imageId) {
        setSelectedImage(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="gallery-component loading">
        <h2>Loading gallery...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-component error">
        <h2>Error loading gallery</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="gallery-component">
      <div className="gallery-header">
        <h2>Your Image Gallery</h2>
        
        <div className="gallery-controls">
          <div className="filter-controls">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'uploaded' ? 'active' : ''}
              onClick={() => setFilter('uploaded')}
            >
              Uploaded
            </button>
            <button 
              className={filter === 'generated' ? 'active' : ''}
              onClick={() => setFilter('generated')}
            >
              Generated
            </button>
            <button 
              className={filter === 'edited' ? 'active' : ''}
              onClick={() => setFilter('edited')}
            >
              Edited
            </button>
          </div>
        </div>
      </div>

      <div className="gallery-grid">
        {filteredImages.map(image => (
          <div 
            key={image.id} 
            className={`gallery-item ${selectedImage === image.id ? 'selected' : ''}`}
            onClick={() => handleImageClick(image)}
          >
            <div className="image-container">
              <Image 
                src={image.storagePath} 
                alt={image.originalFilename} 
                className="gallery-image"
                width={400}
                height={300}
              />
            </div>
            <div className="image-info">
              <h3>{image.originalFilename}</h3>
              <p className="image-type">{image.imageType}</p>
              {image.modelName && (
                <p className="model-used">Model: {image.modelName}</p>
              )}
              <p className="date-created">
                {new Date(image.creationDate).toLocaleDateString()}
              </p>
              
              {image.prompt && (
                <div className="image-prompt">
                  <p>Prompt: {image.prompt}</p>
                </div>
              )}
              
              <div className="image-actions">
                {allowEdit && (
                  <button className="edit-button">Edit</button>
                )}
                {allowDelete && (
                  <button 
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="empty-gallery">
          <p>No images found in this category</p>
        </div>
      )}
    </div>
  );
};

export default Gallery;