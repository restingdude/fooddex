import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { restaurantService } from '../services/restaurantService';
import { removeRestaurant, setRestaurants, updateRestaurant } from '../features/restaurants/restaurantsSlice';
import { RootState } from '../store';
import { Restaurant } from '../types/restaurant';
import './RestaurantList.css';

interface EditModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onSave: (name: string, address: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ restaurant, onClose, onSave }) => {
  const [name, setName] = useState(restaurant.name);
  const [address, setAddress] = useState(restaurant.area);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, address);
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RestaurantList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { restaurants, loading } = useSelector((state: RootState) => state.restaurants);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getAll();
        const serializedData = data.map((restaurant: Restaurant) => ({
          ...restaurant,
          createdAt: restaurant.createdAt instanceof Timestamp 
            ? restaurant.createdAt.toDate().toISOString()
            : restaurant.createdAt instanceof Date 
              ? restaurant.createdAt.toISOString()
              : restaurant.createdAt
        }));
        dispatch(setRestaurants(serializedData));
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, [dispatch]);

  const filteredRestaurants = restaurants.filter((restaurant: Restaurant) => 
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    try {
      const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
      
      if (confirmed) {
        const deleteButton = document.querySelector(`button[data-restaurant-id="${id}"]`);
        if (deleteButton) {
          deleteButton.textContent = 'Deleting...';
          deleteButton.setAttribute('disabled', 'true');
        }

        await restaurantService.delete(id);
        dispatch(removeRestaurant(id));
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant. Please try again.');
      
      const deleteButton = document.querySelector(`button[data-restaurant-id="${id}"]`);
      if (deleteButton) {
        deleteButton.textContent = 'Delete';
        deleteButton.removeAttribute('disabled');
      }
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
  };

  const handleSaveEdit = async (name: string, address: string) => {
    if (!editingRestaurant) return;

    try {
      const updatedRestaurant = {
        ...editingRestaurant,
        name,
        area: address,
        searchName: name.toLowerCase()
      };

      await restaurantService.update(editingRestaurant.id, updatedRestaurant);
      dispatch(updateRestaurant(updatedRestaurant));
      setEditingRestaurant(null);
      alert('Restaurant updated successfully!');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Failed to update restaurant. Please try again.');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner">Loading...</div>
    </div>
  );

  return (
    <div className="content-area">
      <div className="list-header">
        <h1>Restaurants</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="table-container">
        <table className="restaurant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Area</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.map((restaurant) => (
              <tr key={restaurant.id}>
                <td>{restaurant.name}</td>
                <td>{restaurant.area}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEdit(restaurant)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button 
                      data-restaurant-id={restaurant.id}
                      onClick={() => handleDelete(restaurant.id, restaurant.name)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredRestaurants.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-state">
                  {searchQuery ? 'No restaurants found matching your search' : 'No restaurants available'}
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
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default RestaurantList;