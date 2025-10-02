// src/app/admin/analytics/page.tsx
// Analytics dashboard page for admin users

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types for analytics data
interface UserModelUsage {
  usageCount: number;
  creditsConsumed: number;
  avgProcessingTime: number; // seconds
  costPerUse: number; // credits
}

interface AnalyticsData {
  totalUsers: number;
  activeUsersToday: number;
  totalImagesGenerated: number;
  totalCreditsUsed: number;
  modelUsage: {
    'qwen-image-edit': UserModelUsage;
    'gemini-flash-image': UserModelUsage;
  };
  revenue: {
    total: number; // in cents
    last30Days: number; // in cents
  };
}

const AdminAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll use mock data
        const mockData: AnalyticsData = {
          totalUsers: 150,
          activeUsersToday: 45,
          totalImagesGenerated: 1250,
          totalCreditsUsed: 2500,
          modelUsage: {
            'qwen-image-edit': {
              usageCount: 800,
              creditsConsumed: 1500,
              avgProcessingTime: 15.5,
              costPerUse: 3.0
            },
            'gemini-flash-image': {
              usageCount: 450,
              creditsConsumed: 1000,
              avgProcessingTime: 18.2,
              costPerUse: 2.5
            }
          },
          revenue: {
            total: 12500,
            last30Days: 3200
          }
        };

        setAnalyticsData(mockData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Platform usage statistics and insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Today</h3>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.activeUsersToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Images Generated</h3>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalImagesGenerated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Credits Used</h3>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.totalCreditsUsed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">${(analyticsData.revenue.total / 100).toFixed(2)}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900">Last 30 Days</h3>
              <p className="text-3xl font-bold text-gray-900">${(analyticsData.revenue.last30Days / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Model Usage Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Model Usage</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* qwen-image-edit Model */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">qwen-image-edit</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Usage Count:</span>
                  <span className="font-medium">{analyticsData.modelUsage['qwen-image-edit'].usageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Consumed:</span>
                  <span className="font-medium">{analyticsData.modelUsage['qwen-image-edit'].creditsConsumed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Processing Time:</span>
                  <span className="font-medium">{analyticsData.modelUsage['qwen-image-edit'].avgProcessingTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Per Use:</span>
                  <span className="font-medium">{analyticsData.modelUsage['qwen-image-edit'].costPerUse} credits</span>
                </div>
              </div>
            </div>

            {/* gemini-flash-image Model */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">gemini-flash-image</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Usage Count:</span>
                  <span className="font-medium">{analyticsData.modelUsage['gemini-flash-image'].usageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Consumed:</span>
                  <span className="font-medium">{analyticsData.modelUsage['gemini-flash-image'].creditsConsumed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Processing Time:</span>
                  <span className="font-medium">{analyticsData.modelUsage['gemini-flash-image'].avgProcessingTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Per Use:</span>
                  <span className="font-medium">{analyticsData.modelUsage['gemini-flash-image'].costPerUse} credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;