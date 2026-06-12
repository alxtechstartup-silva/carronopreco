import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('favorites')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setFavorites(data.favorites || []);
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
      await supabase
        .from('users')
        .update({ favorites: newFavs })
        .eq('id', user.id);
    } else {
      localStorage.setItem('favorites', JSON.stringify(newFavs));
    }
  };

  return { favorites, toggleFavorite };
}
