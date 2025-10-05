import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface DashboardProps {
  userId: string;
  userEmail: string;
  initialCreditBalance: number;
  onGenerateImage: (prompt: string, model: string) => void;
  onPurchaseCredits: () => void;
  availableModels: Array<{ name: string; cost: number }>;
}

interface CreditTransaction {
  id: string;
  transactionType: string;
  amount: number;
  date: Date;
  description: string;
  aiModelUsed?: string;
}

interface Image {
  id: string;
  originalFilename: string;
  storagePath: string;
  creationDate: Date;
  imageType: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userId, 
  userEmail, 
  initialCreditBalance, 
  onGenerateImage, 
  onPurchaseCredits,
  availableModels
}) => {
  const [creditBalance, setCreditBalance] = useState<number>(initialCreditBalance);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(availableModels[0]?.name || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [recentImages, setRecentImages] = useState<Image[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'gallery'>('generate');

  // Mock data loading - in real implementation, this would fetch from API
  useEffect(() => {
    // Simulate loading recent transactions
    const mockTransactions: CreditTransaction[] = [
      { id: '1', transactionType: 'CREDIT_BONUS', amount: 100, date: new Date(Date.now() - 24 * 60 * 60 * 1000), description: 'Welcome bonus' },
      { id: '2', transactionType: 'IMAGE_GENERATION', amount: -5, date: new Date(Date.now() - 2 * 60 * 60 * 1000), description: 'Image generation', aiModelUsed: 'qwen-image-edit' },
      { id: '3', transactionType: 'IMAGE_EDIT', amount: -10, date: new Date(Date.now() - 1 * 60 * 60 * 1000), description: 'Image edit', aiModelUsed: 'gemini-flash-image' },
    ];
    
    setRecentTransactions(mockTransactions);
    
    // Simulate loading recent images
    const mockImages: Image[] = [
      { id: 'img1', originalFilename: 'sunset.png', storagePath: '/images/sunset.png', creationDate: new Date(), imageType: 'GENERATED' },
      { id: 'img2', originalFilename: 'mountain-edit.jpg', storagePath: '/images/mountain-edit.jpg', creationDate: new Date(Date.now() - 60 * 60 * 1000), imageType: 'EDITED' },
      { id: 'img3', originalFilename: 'beach.jpg', storagePath: '/images/beach.jpg', creationDate: new Date(Date.now() - 2 * 60 * 60 * 1000), imageType: 'GENERATED' },
    ];
    
    setRecentImages(mockImages);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // In a real implementation, this would call the generate API
      console.log(`Generating image with prompt: "${prompt}" using model: ${selectedModel}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would be the actual API call:
      // await onGenerateImage(prompt, selectedModel);
      
      // Update credit balance (mock)
      const modelCost = availableModels.find(m => m.name === selectedModel)?.cost || 0;
      setCreditBalance(prev => prev - modelCost);
      
      // Reset form
      setPrompt('');
    } catch (err) {
      console.error('Generation error:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="dashboard-component">
      <div className="dashboard-header">
        <h1>Welcome, {userEmail}!</h1>
        <div className="credit-balance">
          <span className="balance-label">Credits: </span>
          <span className="balance-amount">{creditBalance}</span>
          <button onClick={onPurchaseCredits} className="purchase-button">Add Credits</button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'generate' ? 'active' : ''}
          onClick={() => setActiveTab('generate')}
        >
          Generate Image
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Credit History
        </button>
        <button 
          className={activeTab === 'gallery' ? 'active' : ''}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'generate' && (
          <div className="generate-tab">
            <h2>Generate New Image</h2>
            <form onSubmit={handleSubmit} className="generation-form">
              <div className="input-group">
                <label htmlFor="prompt">Image Prompt:</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
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
                disabled={isGenerating}
                className="generate-button"
              >
                {isGenerating ? 'Generating...' : 'Generate Image'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <h2>Credit History</h2>
            <div className="transactions-list">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-type">{transaction.transactionType}</span>
                    <span className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-description">{transaction.description}</span>
                    {transaction.aiModelUsed && (
                      <span className="model-used">Model: {transaction.aiModelUsed}</span>
                    )}
                    <span className="transaction-date">
                      {new Date(transaction.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-tab">
            <h2>Your Images</h2>
            <div className="images-grid">
              {recentImages.map(image => (
                <div key={image.id} className="image-card">
                  <div className="image-preview">
                    <Image src={image.storagePath} alt={image.originalFilename} width={400} height={300} />
                  </div>
                  <div className="image-info">
                    <h4>{image.originalFilename}</h4>
                    <p>Type: {image.imageType}</p>
                    <p>Date: {new Date(image.creationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;