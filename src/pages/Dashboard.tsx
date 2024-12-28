import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Restaurant } from '../types/restaurant';

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const q = query(collection(db, 'restaurants'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const restaurantData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Restaurant[];
      setRestaurants(restaurantData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const stats = [
    {
      title: 'Total Restaurants',
      value: restaurants.length,
      icon: '🏪',
    },
    {
      title: 'Recently Added',
      value: restaurants.filter(r => {
        const createdAt = r.createdAt;
        if (!(createdAt instanceof Timestamp)) return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt.toDate() > thirtyDaysAgo;
      }).length,
      icon: '🆕',
    },
    {
      title: 'Areas Covered',
      value: Array.from(new Set(restaurants.map(r => r.area))).length,
      icon: '📍',
    }
  ];

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading dashboard data...</div>;
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="dashboard-stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <h3>{stat.title}</h3>
                  <p className="stat-value">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'analytics':
        return (
          <div className="analytics-section">
            <h3>Restaurant Analytics</h3>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Restaurants by Area</h4>
                <ul className="area-list">
                  {Object.entries(
                    restaurants.reduce((acc, restaurant) => {
                      acc[restaurant.area] = (acc[restaurant.area] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([area, count]) => (
                    <li key={area}>
                      {area}: {count} restaurants
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-section">
            <h3>Dashboard Settings</h3>
            <p>Settings panel coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="content-area">
      <div className="dashboard-header">
        <h1>Restaurant Dashboard</h1>
        <p className="dashboard-subtitle">Overview of your restaurant network</p>
        
        <div className="tab-container dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;