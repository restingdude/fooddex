import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Restaurant } from '../../types/restaurant';

interface RestaurantsState {
  restaurants: Restaurant[];
  loading: boolean;
}

const initialState: RestaurantsState = {
  restaurants: [],
  loading: false
};

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setRestaurants: (state, action: PayloadAction<Restaurant[]>) => {
      state.restaurants = action.payload;
    },
    removeRestaurant: (state, action: PayloadAction<string>) => {
      state.restaurants = state.restaurants.filter(restaurant => restaurant.id !== action.payload);
    },
    addRestaurant: (state, action: PayloadAction<Restaurant>) => {
      state.restaurants.push(action.payload);
    },
    updateRestaurant: (state, action: PayloadAction<Restaurant>) => {
      const index = state.restaurants.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.restaurants[index] = action.payload;
      }
    }
  },
});

export const { setRestaurants, removeRestaurant, addRestaurant, updateRestaurant } = restaurantsSlice.actions;
export default restaurantsSlice.reducer;