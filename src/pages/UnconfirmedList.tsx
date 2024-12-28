import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { unconfirmedRestaurantService } from '../services/unconfirmedRestaurantService';
import { restaurantService } from '../services/restaurantService';
import { geocodingService } from '../services/geocodingService';
import { UnconfirmedRestaurant, RestaurantInput } from '../types/restaurant';
import { Timestamp } from 'firebase/firestore';
import * as geohash from 'ngeohash';
import './UnconfirmedList.css';

interface EditModalProps {
  restaurant: UnconfirmedRestaurant;
  onClose: () => void;
  onConfirm: (name: string, address: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ restaurant, onClose, onConfirm }) => {
  const [name, setName] = useState(restaurant.name);
  const [address, setAddress] = useState(restaurant.address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(name, address);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Restaurant Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Restaurant Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="confirm-button">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UnconfirmedList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<UnconfirmedRestaurant[]>([]);
  const [editingRestaurant, setEditingRestaurant] = useState<UnconfirmedRestaurant | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log('Fetching unconfirmed restaurants...');
        const data = await unconfirmedRestaurantService.getPending();
        console.log('Fetched restaurants:', data);
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching unconfirmed restaurants:', error);
        alert('Failed to load unconfirmed restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const formatDate = (date: Date | Timestamp) => {
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const handleApprove = async (restaurant: UnconfirmedRestaurant) => {
    setEditingRestaurant(restaurant);
  };

  const handleConfirmApproval = async (name: string, address: string) => {
    if (!editingRestaurant) return;

    try {
      setLoading(true);

      // Get coordinates for the address
      const coordinates = await geocodingService.getCoordinates(address);

      // Transform unconfirmed restaurant to match restaurant format
      const restaurantData: RestaurantInput = {
        name: name,
        area: address,
        location: {
          latitude: coordinates.lat,
          longitude: coordinates.lng
        },
        place_id: 'manualadd',
        searchName: name.toLowerCase()
      };

      // Add to restaurants collection
      await restaurantService.add(restaurantData);

      // Get the user ID from the path
      const pathParts = editingRestaurant.id.split('/');
      const userId = pathParts[1];
      const restaurantId = pathParts[3];

      // Delete from unconfirmed restaurants collection
      await unconfirmedRestaurantService.delete(userId, restaurantId);

      // Remove from local state
      setRestaurants(prev => prev.filter(r => r.id !== editingRestaurant.id));
      setEditingRestaurant(null);
      alert('Restaurant approved successfully!');
    } catch (error) {
      console.error('Error approving restaurant:', error);
      alert('Failed to approve restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (restaurant: UnconfirmedRestaurant) => {
    // TODO: Implement reject functionality
    console.log('Rejecting restaurant:', restaurant);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="list-header">
        <h1>Unconfirmed Restaurants</h1>
      </div>
      
      <div className="table-container">
        <table className="restaurant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td>{restaurant.name}</td>
                <td>{restaurant.address}</td>
                <td>{formatDate(restaurant.submittedAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleApprove(restaurant)}
                      className="approve-button"
                      title="Approve"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleReject(restaurant)}
                      className="reject-button"
                      title="Reject"
                    >
                      ✗
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {restaurants.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  No unconfirmed restaurants to review
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingRestaurant && (
        <EditModal
          restaurant={editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onConfirm={handleConfirmApproval}
        />
      )}
    </div>
  );
};

export default UnconfirmedList; 