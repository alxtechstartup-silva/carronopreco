import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Lead {
  id?: string;
  vehicleId: string;
  dealerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  status: 'new' | 'contacted' | 'negotiating' | 'closed' | 'lost';
  score?: number;
  aiPriority?: 'high' | 'medium' | 'low';
  aiAdvice?: string;
  createdAt: any;
}

const COLLECTION = 'leads';

export const leadService = {
  async create(data: Omit<Lead, 'id' | 'createdAt' | 'status'>) {
    // 1. Save to Firestore
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      status: 'new',
      createdAt: Timestamp.now()
    });

    // 2. Asynchronous AI Scoring (UI handles the refresh or we can wait)
    // In a real app, this would be a Cloud Function hook
    try {
      const response = await fetch('/api/ai/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: data.customerName,
          message: data.message,
          vehicleInfo: { id: data.vehicleId }
        })
      });
      const scoring = await response.json();
      
      await updateDoc(doc(db, COLLECTION, docRef.id), {
        score: scoring.score,
        aiPriority: scoring.priority,
        aiAdvice: scoring.advice
      });
    } catch (e) {
      console.warn("AI Scoring failed, falling back to manual", e);
    }

    return docRef.id;
  },

  async getDealerLeads(dealerId: string) {
    const q = query(
      collection(db, COLLECTION), 
      where('dealerId', '==', dealerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
  }
};
