import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      getDoc(docRef).then(snap => {
        if (snap.exists()) {
          setFavorites(snap.data().favorites || []);
        }
      });
    } else {
      const local = localStorage.getItem('favorites');
      if (local) setFavorites(JSON.parse(local));
    }
  }, [user]);

  const toggleFavorite = async (vehicleId: string) => {
    const isFav = favorites.includes(vehicleId);
    let newFavs = [];
    
    if (isFav) {
      newFavs = favorites.filter(id => id !== vehicleId);
    } else {
      newFavs = [...favorites, vehicleId];
    }

    setFavorites(newFavs);

    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { favorites: newFavs }, { merge: true });
    } else {
      localStorage.setItem('favorites', JSON.stringify(newFavs));
    }
  };

  return { favorites, toggleFavorite };
}
