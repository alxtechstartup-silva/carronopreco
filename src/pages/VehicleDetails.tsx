import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Share2, Heart, ShieldCheck, 
  Settings, Fuel, Calendar, Gauge, MessageCircle, 
  Phone, Zap, Info, TrendingDown, ArrowRight, Loader2,
  Search, ChevronRight
} from 'lucide-react';
import { formatCurrency, formatKm } from '../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { leadService } from '../services/leadService';
import { db } from '../lib/firebase';

export default function VehicleDetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab ] = useState('descrição');
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'vehicles', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Erro ao carregar veículo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await leadService.create({
        vehicleId: id || 'demo',
        dealerId: vehicle?.ownerId || 'admin',
        customerName: leadForm.name,
        customerPhone: leadForm.phone,
        message: leadForm.message,
        vehicleInfo: { brand: vehicle?.brand, model: vehicle?.model } // Adding for dashboard view
      } as any);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary gap-6">
        <Info size={60} className="text-white/20" />
        <h2 className="text-2xl font-bold">Veículo não encontrado</h2>
        <button className="bg-accent px-8 py-3 rounded-xl font-bold" onClick={() => window.history.back()}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* ... prev bar ... */}
      <div className="bg-surface/50 border-b border-white/5 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors" onClick={() => window.history.back()}>
            <ChevronLeft size={20} /> Voltar para busca
          </button>
          <div className="flex gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><Share2 size={20} /></button>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors"><Heart size={20} /></button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="h-[500px] bg-surface rounded-3xl overflow-hidden border border-white/5">
                <img 
                  src={vehicle.images?.[0] || "https://images.unsplash.com/photo-1542362567-b0526a626c11?auto=format&fit=crop&q=80&w=1200"}
                  className="w-full h-full object-cover"
                  alt={vehicle.model}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {(vehicle.images?.length > 1 ? vehicle.images : [1, 2, 3, 4]).map((img: any, i: number) => (
                  <div key={i} className="h-32 bg-surface rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:border-accent group">
                    <img 
                      src={typeof img === 'string' ? img : `https://images.unsplash.com/photo-${1542362567 + i}?auto=format&fit=crop&q=80&w=400`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt="Thumbnail"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Title & Key Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Premium</span>
                  <span className="bg-white/5 text-white/40 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12} /> Verificado</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">{vehicle.brand} {vehicle.model}</h1>
                <p className="text-white/40 font-medium">{vehicle.category} • {vehicle.year}</p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <TrendingDown className="text-gold" size={16} />
                  <span className="text-xs text-gold font-bold">Oportunidade Única</span>
                </div>
                <p className="text-4xl font-bold text-accent font-mono">{formatCurrency(vehicle.price)}</p>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: 'Ano', value: vehicle.year },
                { icon: Gauge, label: 'Quilometragem', value: `${vehicle.km} km` },
                { icon: Fuel, label: 'Combustível', value: vehicle.fuelType || 'Gasolina' },
                { icon: Settings, label: 'Câmbio', value: 'Automático' }
              ].map((spec, i) => (
                <div key={i} className="bg-surface p-4 rounded-2xl border border-white/5">
                  <spec.icon className="text-white/20 mb-2" size={20} />
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{spec.label}</p>
                  <p className="font-bold">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs Section */}
            <div className="space-y-6">
              <div className="flex gap-8 border-b border-white/5">
                {['Descrição', 'Histórico', 'Opcionais'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.toLowerCase() ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
                  >
                    {tab}
                    {activeTab === tab.toLowerCase() && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                  </button>
                ))}
              </div>

              <div className="text-white/60 leading-relaxed text-sm">
                {activeTab === 'descrição' && (
                  <p>{vehicle.description || 'Nenhuma descrição fornecida para este veículo.'}</p>
                )}
                {activeTab === 'histórico' && (
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 py-2"><span>Procedência</span><span className="text-white font-medium">Verificada</span></div>
                    <div className="flex justify-between border-b border-white/5 py-2"><span>Leilão / Sinistro</span><span className="text-green-500 font-medium">Nada Consta</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Conversion (Right) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Lead Card */}
            <div className="bg-surface p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 sticky top-24">
              {!submitted ? (
                <form onSubmit={handleContact} className="space-y-4">
                  <h4 className="font-bold text-lg mb-2">Tenho Interesse</h4>
                  <div className="space-y-4">
                    <input 
                      required
                      placeholder="Seu Nome" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-accent text-sm"
                      value={leadForm.name}
                      onChange={e => setLeadForm({...leadForm, name: e.target.value})}
                    />
                    <input 
                      required
                      placeholder="WhatsApp" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-accent text-sm"
                      value={leadForm.phone}
                      onChange={e => setLeadForm({...leadForm, phone: e.target.value})}
                    />
                    <textarea 
                      placeholder="Olá, gostaria de saber mais informações sobre este veículo..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-accent text-sm h-32"
                      value={leadForm.message}
                      onChange={e => setLeadForm({...leadForm, message: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-accent hover:bg-accent/90 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all mt-4"
                  >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><MessageCircle size={20} /> Enviar Proposta</>}
                  </button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Proposta Enviada!</h3>
                  <p className="text-sm text-white/40">Um consultor entrará em contato em breve.</p>
                  <button onClick={() => setSubmitted(false)} className="text-xs text-accent font-bold uppercase tracking-widest mt-4">Enviar outra mensagem</button>
                </motion.div>
              )}
            </div>
            
            {/* ... rest of sidebar ... */}
            <div className="bg-surface p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2"><TrendingDown size={16} className="text-gold" /> Valorização Fipe</h4>
                <Info size={14} className="text-white/20" />
              </div>
              <div className="relative h-20 flex items-end gap-1">
                {[40, 50, 45, 60, 55, 48].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-sm group relative">
                    <div className="absolute bottom-0 w-full bg-accent/40 rounded-t-sm transition-all duration-1000" style={{ height: `${h}%` }}></div>
                     <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-primary text-[10px] font-bold px-1 rounded transition-opacity">780k</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/40">Este carro está com preço de oportunidade histórica. A média de mercado em SP é R$ 825.000.</p>
            </div>

            {/* Enterprise Services Marketplace Card */}
            <div className="bg-surface p-8 rounded-[40px] border border-white/5 space-y-6">
               <h4 className="font-bold flex items-center gap-2"><ShieldCheck className="text-accent" size={20} /> Serviços Elite</h4>
               <div className="space-y-3">
                  <ServiceItem icon={ShieldCheck} label="Seguro Premium" price="A partir R$ 850/mês" />
                  <ServiceItem icon={Zap} label="Garantia 1 Ano" price="Incluso no Plano VIP" />
                  <ServiceItem icon={Search} label="Vistoria Cautelar" price="Laudo Digital Aprovado" />
               </div>
               <button className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all">
                  Personalizar Pacote
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceItem({ icon: Icon, label, price }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
             <Icon size={16} />
          </div>
          <div>
            <p className="text-xs font-bold">{label}</p>
            <p className="text-[10px] text-white/40">{price}</p>
          </div>
       </div>
       <ChevronRight size={14} className="text-white/20" />
    </div>
  );
}
