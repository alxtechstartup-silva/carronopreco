import { supabase } from '../lib/supabase';

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
    // 1. Save to Supabase
    const { data: inserted, error } = await supabase
      .from(COLLECTION)
      .insert({
        ...data,
        status: 'new',
        createdAt: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting lead to Supabase:', error);
      throw error;
    }

    // 2. AI Scoring Pipeline
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
      
      await supabase
        .from(COLLECTION)
        .update({
          score: scoring.score,
          aiPriority: scoring.priority,
          aiAdvice: scoring.advice
        })
        .eq('id', inserted.id);
    } catch (e) {
      console.warn("AI Scoring pipeline failed, remaining manual validation", e);
    }

    return inserted.id;
  },

  async getDealerLeads(dealerId: string) {
    const { data, error } = await supabase
      .from(COLLECTION)
      .select('*')
      .eq('dealerId', dealerId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error listing dealer leads:', error);
      throw error;
    }
    return (data || []) as Lead[];
  }
};
