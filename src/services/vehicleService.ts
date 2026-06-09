import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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
}

const COLLECTION = 'vehicles';

export const vehicleService = {
  async getAll(filters?: any) {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (filters?.brand) {
      q = query(q, where('brand', '==', filters.brand));
    }
    if (filters?.dealerId) {
      q = query(q, where('dealerId', '==', filters.dealerId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
  },

  async getById(id: string) {
    const docRef = doc(db, COLLECTION, id);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } as Vehicle : null;
  },

  async create(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Vehicle>) {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  }
};
