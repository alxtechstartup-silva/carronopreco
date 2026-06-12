import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, Car, Users, MessageSquare, 
  Plus, Search, TrendingUp, AlertCircle,
  Clock, Filter, Download, Target, Loader2, Check, X, ShieldAlert, Sparkles, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency, cn } from '../lib/utils';
import { 
  ResponsiveContainer, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { useAuth } from '../components/providers/AuthProvider';

const analyticsData = [
  { name: 'Seg', leads: 4, views: 240 },
  { name: 'Ter', leads: 7, views: 300 },
  { name: 'Qua', leads: 5, views: 280 },
  { name: 'Qui', leads: 9, views: 350 },
  { name: 'Sex', leads: 12, views: 450 },
  { name: 'Sab', leads: 15, views: 600 },
  { name: 'Dom', leads: 10, views: 400 },
];

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState<'performance' | 'moderation'>('performance');

  useEffect(() => {
    if (!user) return;

    const fetchLeadsAndVehicles = async () => {
      try {
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('createdAt', { ascending: false });

        if (leadsError) throw leadsError;
        setLeads(leadsData || []);

        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .order('createdAt', { ascending: false });

        if (vehiclesError) throw vehiclesError;
        setVehicles(vehiclesData || []);
      } catch (error) {
        console.error("Erro ao carregar dados do admin dashboard no Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadsAndVehicles();

    // Set up Realtime changes
    const leadsChannel = supabase
      .channel('admin-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeadsAndVehicles();
      })
      .subscribe();

    const vehiclesChannel = supabase
      .channel('admin-vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchLeadsAndVehicles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(vehiclesChannel);
    };
  }, [user]);

  const handleApprove = async (id: string) => {
    try {
      await supabase.from('vehicles').update({ status: 'active' }).eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await supabase.from('vehicles').update({ status: 'pending' }).eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const isUserAdmin = user?.email === 'alexdossantos813@gmail.com' || profile?.role === 'admin';

  if (!user || !isUserAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 text-center max-w-md mx-auto px-4">
        <AlertCircle size={60} className="text-amber-500/80 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Acesso Restrito de Administrador</h2>
        <p className="text-white/40 text-sm">Esta área é reservada para moderadores oficiais do Carro no Preço. Para acessar usando sua conta, por favor entre em contato com alexdossantos813@gmail.com.</p>
        <button onClick={() => window.location.href = '/perfil'} className="bg-accent px-8 py-3 rounded-xl font-bold text-sm text-white">Voltar ao Meu Perfil</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Painel Enterprise</h1>
          <p className="text-white/40 font-medium">Controle de anúncios, auditoria de propostas e inteligência antifraude</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveSegment('performance')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              activeSegment === 'performance' ? 'bg-accent text-white shadow' : 'text-white/40 hover:text-white'
            )}
          >
            Performance & CRM
          </button>
          <button 
            onClick={() => setActiveSegment('moderation')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5",
              activeSegment === 'moderation' ? 'bg-accent text-white shadow' : 'text-white/40 hover:text-white'
            )}
          >
            Moderação de Anúncios
            {vehicles.filter(v => v.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {vehicles.filter(v => v.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSegment === 'performance' ? (
        <>
          {/* Analytics Main View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-8 bg-surface p-8 rounded-[32px] border border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Fluxo de Visualizações vs Leads</h3>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-2"><div className="w-3 h-3 bg-accent rounded-full" /> Visitas</span>
                  <span className="flex items-center gap-2"><div className="w-3 h-3 bg-gold rounded-full" /> Leads</span>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3D5AFE" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3D5AFE" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="name" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#161618', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#3D5AFE" fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 gap-6">
              <StatCard label="Total de Anúncios Ativos" value={String(vehicles.filter(v => v.status === 'active').length)} trend={`${vehicles.filter(v => v.isPremium).length} turbinados`} />
              <StatCard label="Leads Recebidos" value={String(leads.length)} trend="+15% este mês" />
              <StatCard label="Faturamento Estimado" value={formatCurrency(vehicles.filter(v => v.isPremium).length * 49.9)} trend="Em tempo real" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Leads Table */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold">Gestão de Leads Qualificados</h3>
              </div>

              <div className="bg-surface rounded-3xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Lead</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Telefone</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Score IA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-all group">
                          <td className="px-6 py-6 font-medium">
                             <p className="text-sm">{lead.customerName}</p>
                             <p className="text-[10px] text-white/40 italic">Interesse: {lead.vehicleInfo?.brand} {lead.vehicleInfo?.model}</p>
                          </td>
                          <td className="px-6 py-6 text-xs text-white/60">
                            {lead.customerPhone || 'Não especificado'}
                          </td>
                          <td className="px-6 py-6 font-mono text-sm">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full", 
                                lead.score && lead.score > 70 ? 'bg-green-500' : 
                                lead.score && lead.score > 40 ? 'bg-orange-500' : 'bg-red-500'
                              )} />
                              <span className="font-mono text-sm">{lead.score || '--'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && !loading && (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-white/20 italic">Nenhum lead encontrado.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-accent/10 border border-accent/20 rounded-[32px] p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white animate-pulse">
                       <Target size={20} />
                    </div>
                    <h4 className="font-bold text-lg">Insight IA de Mercado</h4>
                 </div>
                 <p className="text-sm text-accent/80 leading-relaxed italic">
                   "Detectamos uma alta na procura por SUVs e esportivos no portal. Recomende a seus lojistas cadastrados turbinarem anúncios com mais de 10 dias sem cliques."
                 </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* SEGMENT: AUDITE & MODERATION */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Fila de Moderação em Tempo Real</h3>
            <span className="text-xs text-white/40 font-mono">Total analisados: {vehicles.length} anúncios</span>
          </div>

          <div className="bg-surface rounded-3xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Veículo</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Preço</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Verificação Antifraude</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {vehicles.map((v) => {
                    // Quick analysis calculation inside moderation UI
                    const textScan = `${v.brand} ${v.model} ${v.description || ''}`.toLowerCase();
                    const words = ['facilidade', 'sem consulta', 'urgente pix', 'esquema', 'dinheiro facil'];
                    const hasFlag = words.some(w => textScan.includes(w)) || (v.price && v.price < 5000);

                    return (
                      <tr key={v.id} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/5">
                              <img src={v.images?.[0] || 'https://images.unsplash.com/photo-1542362567-b0526a626c11?auto=format&fit=crop&q=80&w=80'} className="w-full h-full object-cover" alt="carro" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-white">{v.brand} {v.model}</p>
                              <p className="text-[10px] text-white/40 truncate max-w-xs">{v.description || 'Sem descrição'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-bold text-white">
                          {formatCurrency(v.price)}
                        </td>
                        <td className="px-6 py-4">
                          {hasFlag ? (
                            <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 py-1 px-2.5 rounded-full text-[10px] font-bold">
                              <ShieldAlert size={12} /> SPAM / SUSPEITO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 py-1 px-2.5 rounded-full text-[10px] font-bold">
                              <Check size={12} /> SEGURO
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                            v.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                          )}>
                            {v.status === 'active' ? 'Aprovado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {v.status !== 'active' ? (
                              <button 
                                onClick={() => handleApprove(v.id)}
                                className="p-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-lg transition-all"
                                title="Aprovar Anúncio"
                              >
                                <Check size={16} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleReject(v.id)}
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white rounded-lg transition-all"
                                title="Mudar para Pendente"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {vehicles.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-white/20 italic">Nenhum veículo cadastrado na fila de auditoria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ label, value, trend }: { label: string, value: string, trend: string }) {
  return (
    <div className="bg-surface p-6 rounded-3xl border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</p>
        <span className="text-xs font-bold text-accent">{trend}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

