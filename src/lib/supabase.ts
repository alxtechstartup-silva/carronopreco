// ====================================================================
// CLEAN SELF-CONTAINED LOCAL/OFFLINE DATABASE ENGINE FOR CARRO NO PREÇO
// ====================================================================
// This file replaces traditional Supabase network queries with a robust,
// high-fidelity, reactive localStorage-backed database. It fully emulates
// users, vehicles, leads, events, notes, notifications, and analytics.

import { createClient } from '@supabase/supabase-js';

// Helper to generate UUIDs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Low-level LocalStorage handlers
function loadLocalStorageTable(tableName: string): any[] {
  const key = `carro_preco_${tableName}`;
  const data = localStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(`Erro ao parsear dados da tabela local ${tableName}`, e);
    }
  }
  return [];
}

function saveLocalStorageTable(tableName: string, data: any[]) {
  const key = `carro_preco_${tableName}`;
  localStorage.setItem(key, JSON.stringify(data));
}

// Standard Real-time subscriptions listeners
const channelListeners: Array<{
  channelName: string;
  tableName: string;
  callback: (payload: any) => void;
}> = [];

function triggerRealtimeCallbacks(tableName: string) {
  setTimeout(() => {
    channelListeners.forEach(listener => {
      if (listener.tableName === tableName) {
        listener.callback({
          new: {},
          old: {}
        });
      }
    });
  }, 100);
}

// Seed Initial Vehicles database if empty (Pristine catalog right away)
function seedDatabase() {
  const vehicles = loadLocalStorageTable('vehicles');
  if (vehicles.length === 0) {
    const initialVehicles = [
      {
        id: "v-porsche-911",
        dealerId: "dev-alex-uid-123",
        ownerId: "dev-alex-uid-123",
        brand: "Porsche",
        model: "911 Carrera S",
        version: "3.0 Twin-Turbo PDK",
        year: 2022,
        yearModel: 2022,
        km: 5200,
        price: 890000,
        fipePrice: 910000,
        transmission: "automatic",
        fuel: "gasolina",
        color: "Azul Gentian",
        bodyType: "Cupê",
        images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"],
        features: ["Teto Solar", "Escapamento Esportivo", "Som Burmester", "Faróis PDLS Plus"],
        description: "Estado de novo, único dono, todas as revisões realizadas na concessionária autorizada Porsche.",
        status: "active",
        premiumListing: true,
        isPremium: true,
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "v-bmw-m3",
        dealerId: "lojista-demo-id",
        ownerId: "lojista-demo-id",
        brand: "BMW",
        model: "M3 Competition",
        version: "3.0 BiTurbo M xDrive Auto",
        year: 2023,
        yearModel: 2023,
        km: 2400,
        price: 780000,
        fipePrice: 800000,
        transmission: "automatic",
        fuel: "gasolina",
        color: "Verde Isle of Man",
        bodyType: "Sedan",
        images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800"],
        features: ["Bancos de Carbono", "Freios de Cerâmica", "Head-up Display", "M Drive Professional"],
        description: "Espetacular cor Verde Isle of Man, bancos em fibra de carbono concha, tração integral xDrive.",
        status: "active",
        premiumListing: true,
        isPremium: true,
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: "v-audi-rs6",
        dealerId: "lojista-demo-id",
        ownerId: "lojista-demo-id",
        brand: "Audi",
        model: "RS6 Avant",
        version: "4.0 TFSI V8 Mild Hybrid Tiptronic",
        year: 2021,
        yearModel: 2021,
        km: 15300,
        price: 850000,
        fipePrice: 870000,
        transmission: "automatic",
        fuel: "gasolina",
        color: "Preto Mythos",
        bodyType: "Perua (Wagon)",
        images: ["https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800"],
        features: ["Eixo Traseiro Dinâmico", "B&O 3D Sound", "Night Vision", "Suspensão Pneumática"],
        description: "Design arrebatador aliado à versatilidade e potência absurda de 600 cavalos originais.",
        status: "active",
        premiumListing: true,
        isPremium: false,
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
      }
    ];

    saveLocalStorageTable('vehicles', initialVehicles);
  }

  // Prepopulate standard notifications and admin profile
  const users = loadLocalStorageTable('users');
  if (users.length === 0) {
    users.push({
      id: 'dev-alex-uid-123',
      displayName: 'Alex dos Santos',
      email: 'alexdossantos813@gmail.com',
      role: 'admin',
      phone: '+55 (11) 99999-9999',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      whatsappWebhook: '',
      favorites: ['v-porsche-911'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    saveLocalStorageTable('users', users);
  }

  const notifications = loadLocalStorageTable('notifications');
  if (notifications.length === 0) {
    notifications.push({
      id: generateUUID(),
      userId: 'dev-alex-uid-123',
      title: 'Bem-vindo ao Carro no Preço!',
      type: 'info',
      message: 'Sua plataforma está configurada no modo ultra rápido sem conexões externas.',
      read: false,
      createdAt: new Date().toISOString()
    });
    saveLocalStorageTable('notifications', notifications);
  }
}

// Run seeding immediately on file import
seedDatabase();

// Mock query builder for PostgreSQL operations
class MockBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean>;
  private orderField: string | null;
  private orderAsc: boolean;
  private limitCount: number | null;

  constructor(table: string) {
    this.table = table;
    this.filters = [];
    this.orderField = null;
    this.orderAsc = true;
    this.limitCount = null;
  }

  select(fields?: string) {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((item) => {
      // Direct field check
      return item[field] === value;
    });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push((item) => item[field] !== value);
    return this;
  }

  or(filterStr: string) {
    this.filters.push((item) => {
      // Handles e.g. "dealerId.eq.abc,ownerId.eq.abc"
      const parts = filterStr.split(',');
      return parts.some(part => {
        const sub = part.split('.eq.');
        if (sub.length === 2) {
          const field = sub[0].trim();
          const val = sub[1].trim();
          return item[field] === val;
        }
        return false;
      });
    });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderField = field;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  // To support maybeSingle
  async maybeSingle() {
    const data = await this.getData();
    if (data.length === 0) {
      return { data: null, error: null };
    }
    return { data: data[0], error: null };
  }

  // To support single
  async single() {
    const data = await this.getData();
    if (data.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
    }
    return { data: data[0], error: null };
  }

  // Chained await call standard execution (.then)
  async then(resolve: any, reject: any) {
    try {
      const data = await this.getData();
      resolve({ data, error: null });
    } catch (err) {
      reject(err);
    }
  }

  private async getData() {
    let items = loadLocalStorageTable(this.table);
    for (const f of this.filters) {
      items = items.filter(f);
    }
    if (this.orderField) {
      items.sort((a, b) => {
        let valA = a[this.orderField!];
        let valB = b[this.orderField!];
        if (valA === undefined && this.orderField === 'createdAt') {
          valA = a.createdAt || a.created_at || '';
        }
        if (valB === undefined && this.orderField === 'createdAt') {
          valB = b.createdAt || b.created_at || '';
        }
        if (valA < valB) return this.orderAsc ? -1 : 1;
        if (valA > valB) return this.orderAsc ? 1 : -1;
        return 0;
      });
    }
    if (this.limitCount !== null) {
      items = items.slice(0, this.limitCount);
    }
    return items;
  }

  // INSERT API
  insert(recordOrRecords: any) {
    const items = loadLocalStorageTable(this.table);
    const records = Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords];
    const insertedItems: any[] = [];

    for (const rec of records) {
      const newRec = {
        id: rec.id || generateUUID(),
        createdAt: rec.createdAt || new Date().toISOString(),
        updatedAt: rec.updatedAt || new Date().toISOString(),
        ...rec
      };
      items.push(newRec);
      insertedItems.push(newRec);
    }

    saveLocalStorageTable(this.table, items);
    triggerRealtimeCallbacks(this.table);

    // Support chaining .select('id').single()
    return {
      select: (fields?: string) => {
        return {
          single: async () => {
            return { data: insertedItems[0], error: null };
          },
          then: async (resolve: any) => {
            resolve({ data: insertedItems, error: null });
          }
        };
      },
      then: async (resolve: any) => {
        resolve({ data: insertedItems, error: null });
      }
    };
  }

  // UPDATE API
  update(updates: any) {
    const items = loadLocalStorageTable(this.table);
    const updatedItems = items.map(item => {
      let isMatch = true;
      for (const f of this.filters) {
        if (!f(item)) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    saveLocalStorageTable(this.table, updatedItems);
    triggerRealtimeCallbacks(this.table);

    return {
      then: async (resolve: any) => {
        resolve({ data: null, error: null });
      }
    };
  }

  // DELETE API
  delete() {
    const items = loadLocalStorageTable(this.table);
    const remaining = items.filter(item => {
      let isMatch = true;
      for (const f of this.filters) {
        if (!f(item)) {
          isMatch = false;
          break;
        }
      }
      return !isMatch;
    });

    saveLocalStorageTable(this.table, remaining);
    triggerRealtimeCallbacks(this.table);

    return {
      then: async (resolve: any) => {
        resolve({ data: null, error: null });
      }
    };
  }
}

// Authentication listeners callbacks
const authListeners: Array<(event: string, session: any) => void> = [];

// Clean, reactive Supabase client instance mock
const mockSupabase: any = {
  auth: {
    async getSession() {
      const sessionStr = localStorage.getItem('carro_preco_auth_session');
      if (sessionStr) {
        return { data: { session: JSON.parse(sessionStr) }, error: null };
      }
      // Automagically authorize Master Admin profile on first run for frictionless dashboard experience!
      const defaultSession = {
        user: {
          id: 'dev-alex-uid-123',
          email: 'alexdossantos813@gmail.com',
          user_metadata: {
            full_name: 'Alex dos Santos',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
          }
        },
        access_token: 'local-token-master-alex'
      };
      localStorage.setItem('carro_preco_auth_session', JSON.stringify(defaultSession));
      return { data: { session: defaultSession }, error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.push(callback);
      // Fire back immediately with current state
      const sessionStr = localStorage.getItem('carro_preco_auth_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      setTimeout(() => {
        callback('INITIAL_SESSION', session);
      }, 50);

      return {
        data: {
          subscription: {
            unsubscribe() {
              const idx = authListeners.indexOf(callback);
              if (idx !== -1) {
                authListeners.splice(idx, 1);
              }
            }
          }
        }
      };
    },

    async signInWithOAuth({ provider, options }: any) {
      // Simulate OAuth login instantly
      const demoUser = {
        id: 'dev-alex-uid-123',
        email: 'alexdossantos813@gmail.com',
        user_metadata: {
          full_name: 'Alex dos Santos',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        }
      };
      const session = {
        user: demoUser,
        access_token: 'local-token-master-alex'
      };
      localStorage.setItem('carro_preco_auth_session', JSON.stringify(session));
      authListeners.forEach(l => l('SIGNED_IN', session));
      return { data: { provider, url: '#' }, error: null };
    },

    async signInWithPassword({ email, password }: any) {
      const users = loadLocalStorageTable('users');
      let matched = users.find(u => u.email === email);
      if (!matched) {
        // Auto-register on login for seamless testing (Developer friendly sandbox)
        const id = 'user-' + Math.floor(Math.random() * 100000);
        matched = {
          id,
          displayName: email.split('@')[0],
          email,
          role: email === 'alexdossantos813@gmail.com' ? 'admin' : (email.includes('lojista') ? 'lojista' : 'cliente'),
          phone: '',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          isVerified: true,
          whatsappWebhook: '',
          favorites: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        users.push(matched);
        saveLocalStorageTable('users', users);
      }

      const session = {
        user: {
          id: matched!.id,
          email: matched!.email,
          user_metadata: {
            full_name: matched!.displayName,
            avatar_url: matched!.avatar
          }
        },
        access_token: 'local-token-' + Math.random().toString(36).substring(2)
      };

      localStorage.setItem('carro_preco_auth_session', JSON.stringify(session));
      authListeners.forEach(l => l('SIGNED_IN', session));

      return { data: { session, user: session.user }, error: null };
    },

    async signUp({ email, password, options }: any) {
      const users = loadLocalStorageTable('users');
      const existing = users.find(u => u.email === email);
      if (existing) {
        return { data: { session: null, user: null }, error: new Error('Este e-mail já está sendo utilizado!') };
      }

      const id = 'user-' + Math.floor(Math.random() * 100000);
      const fullName = options?.data?.full_name || email.split('@')[0];

      const newUser = {
        id,
        displayName: fullName,
        email,
        role: email === 'alexdossantos813@gmail.com' ? 'admin' : (email.includes('lojista') ? 'lojista' : 'cliente'),
        phone: '',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        isVerified: true,
        whatsappWebhook: '',
        favorites: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      saveLocalStorageTable('users', users);

      const session = {
        user: {
          id,
          email,
          user_metadata: {
            full_name: fullName,
            avatar_url: newUser.avatar
          }
        },
        access_token: 'local-token-' + Math.random().toString(36).substring(2)
      };

      localStorage.setItem('carro_preco_auth_session', JSON.stringify(session));
      authListeners.forEach(l => l('SIGNED_IN', session));

      return { data: { session, user: session.user }, error: null };
    },

    async signOut() {
      localStorage.removeItem('carro_preco_auth_session');
      authListeners.forEach(l => l('SIGNED_OUT', null));
      return { error: null };
    },

    async getUser() {
      const sessionStr = localStorage.getItem('carro_preco_auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return { data: { user: session.user }, error: null };
      }
      return { data: { user: null }, error: null };
    },

    async resetPasswordForEmail(email: string) {
      return { data: {}, error: null };
    }
  },

  from(tableName: string) {
    return new MockBuilder(tableName);
  },

  channel(name: string) {
    return {
      on(event: string, filter: any, callback: (payload: any) => void) {
        const tableName = filter.table || 'leads';
        channelListeners.push({
          channelName: name,
          tableName,
          callback
        });
        return this;
      },
      subscribe() {
        return this;
      }
    };
  },

  removeChannel(channel: any) {
    const idx = channelListeners.findIndex(l => l.channelName === channel?.channelName);
    if (idx !== -1) {
      channelListeners.splice(idx, 1);
    }
  }
};

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

const isRealConfigured = !!(rawUrl && rawUrl.includes('.') && rawKey && rawKey.length > 20);

export const supabase: any = isRealConfigured
  ? createClient(rawUrl.trim(), rawKey.trim())
  : mockSupabase;

