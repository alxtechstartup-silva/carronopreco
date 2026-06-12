import { supabase } from '../lib/supabase';

export interface Vehicle {
  id?: string;
  dealerId: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  yearModel: number;
  km: number;
  price: number;
  fipePrice?: number;
  transmission: 'manual' | 'automatic' | 'semi-automatic';
  fuel: 'flex' | 'gasolina' | 'diesel' | 'eletrico' | 'hibrido';
  color: string;
  bodyType: string;
  images: string[];
  features: string[];
  description: string;
  status: 'active' | 'sold' | 'reserved' | 'draft';
  premiumListing: boolean;
  createdAt: any;
  updatedAt: any;
  ownerId?: string; // Suppport both ownerId or dealerId
}

const COLLECTION = 'vehicles';

export const vehicleService = {
  async getAll(filters?: any) {
    let q = supabase.from(COLLECTION).select('*').order('createdAt', { ascending: false });
    
    if (filters?.brand) {
      q = q.eq('brand', filters.brand);
    }
    if (filters?.dealerId) {
      // Support both ownerId and dealerId filters
      q = q.or(`dealerId.eq.${filters.dealerId},ownerId.eq.${filters.dealerId}`);
    }
    
    const { data, error } = await q;
    if (error) {
      console.error('Error fetching vehicles from Supabase:', error);
      throw error;
    }
    return (data || []) as Vehicle[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from(COLLECTION)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching vehicle by ID:', error);
      return null;
    }
    return data as Vehicle | null;
  },

  async create(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const { data: inserted, error } = await supabase
      .from(COLLECTION)
      .insert({
        ...data,
        createdAt: now,
        updatedAt: now
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating vehicle in Supabase:', error);
      throw error;
    }
    return inserted.id;
  },

  async update(id: string, data: Partial<Vehicle>) {
    const { error } = await supabase
      .from(COLLECTION)
      .update({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating vehicle in Supabase:', error);
      throw error;
    }
  }
};
