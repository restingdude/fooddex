import { collection, addDoc, getDocs, query, where, Timestamp, getDoc, setDoc, doc, collectionGroup, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UnconfirmedRestaurant } from '../types/restaurant';
import { auth } from '../firebase';

export const unconfirmedRestaurantService = {
  add: async (data: Omit<UnconfirmedRestaurant, 'id'>) => {
    try {
      console.log('Adding unconfirmed restaurant:', data);

      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, 'unconfirmedRestaurants', userId, 'restaurants'), {
        name: data.name,
        area: data.address,
        location: {
          latitude: data.location.lat,
          longitude: data.location.lng
        },
        geohash: data.geohash,
        addedBy: userId,
        createdAt: Timestamp.fromDate(new Date()),
        status: 'unconfirmed',
        searchName: data.name.toLowerCase(),
        place_id: ''  // This will be set if needed
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding unconfirmed restaurant:', error);
      throw error;
    }
  },

  getPending: async (): Promise<UnconfirmedRestaurant[]> => {
    try {
      console.log('Starting getPending...');
      
      const user = auth.currentUser;
      if (!user) {
        console.log('No authenticated user');
        return [];
      }

      console.log('Current user:', {
        email: user.email,
        uid: user.uid
      });

      // Get the ID token to check admin status
      const idTokenResult = await user.getIdTokenResult(true); // Force token refresh
      console.log('Token claims:', idTokenResult.claims);
      const isAdmin = idTokenResult.claims.admin === true;
      console.log('Is admin:', isAdmin);

      let querySnapshot;
      
      if (isAdmin) {
        // If admin, use collectionGroup to get all unconfirmed restaurants
        console.log('Fetching all unconfirmed restaurants (admin mode)');
        const restaurantsQuery = query(collectionGroup(db, 'restaurants'));
        querySnapshot = await getDocs(restaurantsQuery);
      } else {
        // If not admin, only get user's own restaurants
        console.log('Fetching user restaurants for:', user.uid);
        const restaurantsCollection = collection(db, 'unconfirmedRestaurants', user.uid, 'restaurants');
        querySnapshot = await getDocs(restaurantsCollection);
      }
      
      console.log(`Found ${querySnapshot.size} restaurants`);
      
      const restaurants: UnconfirmedRestaurant[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Restaurant data:', data);
        
        // Only include restaurants with unconfirmed status
        if (data.status === 'unconfirmed') {
          // Convert the data structure to match our UnconfirmedRestaurant type
          const restaurant: UnconfirmedRestaurant = {
            id: doc.ref.path, // Store the full path for delete operations
            name: data.name,
            phoneNumber: data.phoneNumber || '',
            homePhone: data.homePhone || '',
            address: data.area,
            location: {
              lat: data.location.latitude,
              lng: data.location.longitude
            },
            geohash: data.geohash,
            openHours: data.openHours || {
              monday: { timeSlots: [], isClosed: true },
              tuesday: { timeSlots: [], isClosed: true },
              wednesday: { timeSlots: [], isClosed: true },
              thursday: { timeSlots: [], isClosed: true },
              friday: { timeSlots: [], isClosed: true },
              saturday: { timeSlots: [], isClosed: true },
              sunday: { timeSlots: [], isClosed: true }
            },
            isClosed: false,
            submittedAt: data.createdAt instanceof Timestamp ? 
              data.createdAt.toDate() : 
              new Date(data.createdAt),
            status: data.status || 'unconfirmed'
          };
          restaurants.push(restaurant);
        }
      });
      
      console.log('Total restaurants found:', restaurants.length);
      return restaurants;
    } catch (error) {
      console.error('Error getting pending restaurants:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<UnconfirmedRestaurant | null> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the ID token to check admin status
      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.admin === true;

      let restaurantSnap;

      if (isAdmin) {
        // If admin, search in all collections
        const restaurantsQuery = query(collectionGroup(db, 'restaurants'), where('__name__', '==', id));
        const querySnapshot = await getDocs(restaurantsQuery);
        if (!querySnapshot.empty) {
          restaurantSnap = querySnapshot.docs[0];
        }
      } else {
        // If not admin, only look in user's collection
        const restaurantRef = doc(db, 'unconfirmedRestaurants', user.uid, 'restaurants', id);
        restaurantSnap = await getDoc(restaurantRef);
      }

      if (restaurantSnap?.exists()) {
        const data = restaurantSnap.data();
        return {
          id: restaurantSnap.id,
          name: data.name,
          phoneNumber: data.phoneNumber || '',
          homePhone: data.homePhone || '',
          address: data.area,
          location: {
            lat: data.location.latitude,
            lng: data.location.longitude
          },
          geohash: data.geohash,
          openHours: data.openHours || {
            monday: { timeSlots: [], isClosed: true },
            tuesday: { timeSlots: [], isClosed: true },
            wednesday: { timeSlots: [], isClosed: true },
            thursday: { timeSlots: [], isClosed: true },
            friday: { timeSlots: [], isClosed: true },
            saturday: { timeSlots: [], isClosed: true },
            sunday: { timeSlots: [], isClosed: true }
          },
          isClosed: false,
          submittedAt: data.createdAt instanceof Timestamp ? 
            data.createdAt.toDate() : 
            new Date(data.createdAt),
          status: data.status || 'unconfirmed'
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting restaurant:', error);
      throw error;
    }
  },

  update: async (id: string, data: Omit<UnconfirmedRestaurant, 'id'>) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the ID token to check admin status
      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.admin === true;

      if (!isAdmin) {
        throw new Error('Only admins can update unconfirmed restaurants');
      }

      // Find the restaurant first
      const restaurantsQuery = query(collectionGroup(db, 'restaurants'), where('__name__', '==', id));
      const querySnapshot = await getDocs(restaurantsQuery);
      
      if (!querySnapshot.empty) {
        const restaurantRef = querySnapshot.docs[0].ref;
        await setDoc(restaurantRef, {
          name: data.name,
          area: data.address,
          location: {
            latitude: data.location.lat,
            longitude: data.location.lng
          },
          geohash: data.geohash,
          status: 'unconfirmed',
          searchName: data.name.toLowerCase()
        }, { merge: true });
        return true;
      }
      throw new Error('Restaurant not found');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  },

  delete: async (userId: string, restaurantId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the ID token to check admin status
      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.admin === true;

      if (!isAdmin) {
        throw new Error('Only admins can delete unconfirmed restaurants');
      }

      const docRef = doc(db, 'unconfirmedRestaurants', userId, 'restaurants', restaurantId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting unconfirmed restaurant:', error);
      throw error;
    }
  }
}; 