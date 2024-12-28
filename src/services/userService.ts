import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const userService = {
  setAdminRole: async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document with admin role
        await setDoc(userRef, {
          email: auth.currentUser?.email,
          role: 'admin',
          createdAt: new Date(),
          username: auth.currentUser?.email?.split('@')[0] || 'admin'
        });
      } else {
        // Update existing user to admin role
        await setDoc(userRef, {
          ...userDoc.data(),
          role: 'admin'
        }, { merge: true });
      }
      
      return true;
    } catch (error) {
      console.error('Error setting admin role:', error);
      throw error;
    }
  }
}; 