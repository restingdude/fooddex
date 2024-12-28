import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    Timestamp
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import { Restaurant, RestaurantInput } from '../types/restaurant';
  import * as geohash from 'ngeohash';
  
  export const restaurantService = {
    async getAll() {
      const querySnapshot = await getDocs(collection(db, 'restaurants'));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Restaurant;
      });
    },
  
    async getById(id: string) {
      const docRef = doc(db, 'restaurants', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Restaurant not found');
      }
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data
      } as Restaurant;
    },
  
    async add(restaurant: RestaurantInput) {
      // Generate geohash from location
      const hash = geohash.encode(
        restaurant.location.latitude,
        restaurant.location.longitude,
        10
      );
      
      const docRef = await addDoc(collection(db, 'restaurants'), {
        ...restaurant,
        geohash: hash,
        createdAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    },
  
    async update(id: string, restaurant: Partial<Restaurant>) {
      const docRef = doc(db, 'restaurants', id);
      const updateData = { ...restaurant };

      if (restaurant.location) {
        updateData.geohash = geohash.encode(
          restaurant.location.latitude,
          restaurant.location.longitude,
          10
        );
      }

      await updateDoc(docRef, updateData);
    },
  
    async delete(id: string) {
      const docRef = doc(db, 'restaurants', id);
      await deleteDoc(docRef);
    }
  };