import React, { useState, useEffect } from 'react';

interface AdminDashboardProps {
  userId: string;
  userEmail: string;
}

interface UserStat {
  id: string;
  email: string;
  registrationDate: Date;
  creditBalance: number;
  lastLogin?: Date;
}

interface ModelUsageStat {
  name: string;
  usageCount: number;
  lastAccessTime?: Date;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userId, userEmail }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'models' | 'articles' | 'reports'>('users');
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [modelStats, setModelStats] = useState<ModelUsageStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Mock data loading - in real implementation, this would fetch from API
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock user stats
        const mockUserStats: UserStat[] = [
          { id: 'user1', email: 'john@example.com', registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), creditBalance: 45, lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) },
          { id: 'user2', email: 'jane@example.com', registrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), creditBalance: 87, lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000) },
          { id: 'user3', email: 'bob@example.com', registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), creditBalance: 12, lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000) },
          { id: 'user4', email: 'alice@example.com', registrationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), creditBalance: 95, lastLogin: new Date(Date.now() - 30 * 60 * 1000) },
        ];
        
        setUserStats(mockUserStats);
        
        // Mock model stats
        const mockModelStats: ModelUsageStat[] = [
          { name: 'qwen-image-edit', usageCount: 124, lastAccessTime: new Date(Date.now() - 1 * 60 * 60 * 1000) },
          { name: 'gemini-flash-image', usageCount: 89, lastAccessTime: new Date(Date.now() - 30 * 60 * 1000) },
        ];
        
        setModelStats(mockModelStats);
      } catch (err) {
        console.error('Admin data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-component loading">
        <h1>Admin Dashboard</h1>
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-component">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {userEmail}</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={activeTab === 'models' ? 'active' : ''}
          onClick={() => setActiveTab('models')}
        >
          Model Usage
        </button>
        <button 
          className={activeTab === 'articles' ? 'active' : ''}
          onClick={() => setActiveTab('articles')}
        >
          Content Management
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="users-tab">
            <h2>Users</h2>
            <div className="users-list">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th>Credit Balance</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map(user => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                      <td>{user.creditBalance}</td>
                      <td>
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleString() 
                          : 'Never'}
                      </td>
                      <td>
                        <button className="action-button view">View</button>
                        <button className="action-button edit">Edit</button>
                        <button className="action-button delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="models-tab">
            <h2>AI Model Usage</h2>
            <div className="models-stats">
              <table>
                <thead>
                  <tr>
                    <th>Model Name</th>
                    <th>Usage Count</th>
                    <th>Last Access</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modelStats.map(model => (
                    <tr key={model.name}>
                      <td>{model.name}</td>
                      <td>{model.usageCount}</td>
                      <td>
                        {model.lastAccessTime 
                          ? new Date(model.lastAccessTime).toLocaleString() 
                          : 'Never'}
                      </td>
                      <td>Active</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="articles-tab">
            <h2>Articles</h2>
            <div className="articles-controls">
              <button className="action-button new">Create New Article</button>
            </div>
            <div className="articles-list">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Publication Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>How to Use AI for Image Generation</td>
                    <td>admin@example.com</td>
                    <td>Published</td>
                    <td>{new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                    <td>
                      <button className="action-button view">View</button>
                      <button className="action-button edit">Edit</button>
                    </td>
                  </tr>
                  <tr>
                    <td>Best Practices for Image Editing</td>
                    <td>admin@example.com</td>
                    <td>Draft</td>
                    <td>{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                    <td>
                      <button className="action-button view">View</button>
                      <button className="action-button edit">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h2>System Reports</h2>
            <div className="reports-overview">
              <div className="report-card">
                <h3>Total Users</h3>
                <p>1,245</p>
              </div>
              <div className="report-card">
                <h3>Total Images Generated</h3>
                <p>3,421</p>
              </div>
              <div className="report-card">
                <h3>Total Credits Consumed</h3>
                <p>12,450</p>
              </div>
              <div className="report-card">
                <h3>Revenue</h3>
                <p>$2,450</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;