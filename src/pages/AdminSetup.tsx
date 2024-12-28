import React, { useState } from 'react';
import { auth } from '../firebase';
import { userService } from '../services/userService';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setupAdmin = async () => {
    if (!auth.currentUser) {
      setError('Please sign in first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await userService.setAdminRole(auth.currentUser.uid);
      setSuccess(true);
    } catch (error) {
      console.error('Error setting up admin:', error);
      setError('Failed to set up admin role');
    } finally {
      setLoading(false);
    }
  };

  if (!auth.currentUser) {
    return <div>Please sign in first</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Setup</h1>
      <p>Current user: {auth.currentUser.email}</p>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Successfully set up admin role!</div>}
      
      <button 
        onClick={setupAdmin}
        disabled={loading}
        style={{
          padding: '10px 20px',
          marginTop: '20px'
        }}
      >
        {loading ? 'Setting up...' : 'Make Admin'}
      </button>
    </div>
  );
};

export default AdminSetup; 