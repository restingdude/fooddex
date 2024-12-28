import { configureStore } from '@reduxjs/toolkit';
import restaurantsReducer from './features/restaurants/restaurantsSlice';

export const store = configureStore({
  reducer: {
    restaurants: restaurantsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Increase the warning threshold to 100ms
        warnAfter: 100,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 