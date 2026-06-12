import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, Zap, Car, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import SEO from '../components/common/SEO';
import SearchIndex from '../components/layout/SearchIndex';

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'active')
          .limit(3)
          .order('createdAt', { ascending: false });

        if (error) throw error;
        setFeatured(data || []);
      } catch (error) {
        console.error("Erro ao carregar destaques:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);
  return (
    <div className="space-y-20 pb-20">
      <SEO 
        title="O Futuro do Mercado Automotivo" 
        description="A plataforma definitiva para compra e venda de veículos premium e luxo no Brasil." 
      />
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-60 scale-105"
            alt="Tesla Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-none">
              O Carro Certo <br />
              <span className="text-accent italic font-display">No Preço</span> Certo
            </h1>
            <p className="text-xl text-white/60 mb-10 max-w-xl font-light">
              Utilizamos inteligência artificial para garantir que você compre ou venda seu veículo 
              pelo valor mais justo do mercado, com transparência total.
            </p>

            {/* Quick Search */}
            <div className="bg-surface/90 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-2xl flex flex-col md:flex-row gap-2 max-w-4xl">
              <div className="flex-1 flex items-center px-4 gap-3 bg-white/5 rounded-xl h-14 group focus-within:border-accent border border-transparent transition-all">
                <Search className="text-white/40 group-focus-within:text-accent transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Ex: SUV blindado até 200 mil" 
                  className="bg-transparent border-none focus:ring-0 w-full text-sm outline-none"
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                       const query = (e.target as HTMLInputElement).value;
                       try {
                         const res = await fetch('/api/search/smart', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ query })
                         });
                         const filters = await res.json();
                         console.log("AI interpreted filters:", filters);
                         // In a real app, redirect to /busca?params...
                         window.location.href = `/busca?smart=${encodeURIComponent(JSON.stringify(filters))}`;
                       } catch(e) {
                         window.location.href = '/busca';
                       }
                    }
                  }}
                />
                <div className="hidden md:flex items-center gap-1 bg-accent/10 px-2 py-1 rounded text-[8px] font-bold text-accent uppercase tracking-widest whitespace-nowrap">
                   <Zap size={10} /> Smart AI
                </div>
              </div>
              <button className="bg-accent hover:bg-accent/90 text-white px-8 rounded-xl h-14 font-medium transition-all group flex items-center gap-2">
                Buscar Ofertas <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {['Audi', 'BMW', 'Mercedes', 'Porsche', 'Tesla', 'Volvo'].map((brand, i) => (
            <motion.div 
              key={brand}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 hover:border-accent/40 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <Car size={24} className="text-white/40 group-hover:text-accent transition-colors" />
              </div>
              <span className="font-medium text-sm">{brand}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ofertas em Destaque</h2>
            <p className="text-white/40">Os veículos com melhor custo-benefício da semana</p>
          </div>
          <Link to="/busca" className="text-accent flex items-center gap-1 font-medium group">
            Ver todos <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-white/5 animate-pulse rounded-[32px] border border-white/5" />
            ))
          ) : featured.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white/5 rounded-[32px] border border-dashed border-white/10">
              <p className="text-white/40 mb-4">Nenhum veículo em destaque no momento.</p>
              <Link to="/vender" className="text-accent font-bold hover:underline">Seja o primeiro a anunciar →</Link>
            </div>
          ) : (
            featured.map((car) => (
              <div key={car.id} className="premium-card group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={car.images?.[0] || `https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={car.model}
                  />
                  <div className="absolute top-4 left-4 bg-accent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Destaque
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap size={10} className="text-gold" /> Abaixo da Fipe
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{car.brand} {car.model}</h3>
                      <p className="text-white/40 text-sm">{car.year} • {car.km} km • {car.fuelType || 'Gasolina'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent font-mono">{formatCurrency(car.price)}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                        CP
                      </div>
                      <span className="text-xs font-medium">Carro no Preço</span>
                    </div>
                    <Link to={`/veiculo/${car.id}`} className="text-xs font-bold uppercase tracking-widest hover:text-accent transition-colors">
                      Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Value Prop */}
      <section className="bg-white/5 py-24">
        {/* ... */}
      </section>

      <SearchIndex />
    </div>
  );
}
