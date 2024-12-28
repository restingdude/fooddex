import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RestaurantList from './pages/RestaurantList';
import UnconfirmedList from './pages/UnconfirmedList';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function App() {
  const { user } = useAuth();

  return (
    <div className="admin-panel">
      {user && <Navbar />}
      <div className="page-container">
        <div className="page-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/restaurants" element={
              <ProtectedRoute>
                <RestaurantList />
              </ProtectedRoute>
            } />
            <Route path="/unconfirmed" element={
              <ProtectedRoute>
                <UnconfirmedList />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;