import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Phone, MessageCircle, Star, BadgeCheck, Search, Car, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function DealerProfile() {
  const { id } = useParams();

  return (
    <div className="pb-20">
      {/* Dealer Header */}
      <section className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Dealership"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative h-full flex flex-col justify-end pb-10">
          <div className="flex flex-col md:flex-row items-end gap-8">
            <div className="w-32 h-32 bg-surface rounded-3xl border-4 border-primary shadow-2xl overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1599305090598-fe179d501027?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Logo" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">Stuttgart Motors</h1>
                <BadgeCheck className="text-accent" size={24} />
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
                <span className="flex items-center gap-1"><MapPin size={16} /> Jardim Europa, São Paulo</span>
                <span className="flex items-center gap-1"><Star className="text-gold" size={16} /> 4.9 (1.2k avaliações)</span>
                <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase">Parceiro Premium</span>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                <MessageCircle size={18} /> Iniciar Chat VIP
              </button>
              <button className="w-full bg-white/5 text-white py-4 rounded-2xl font-bold border border-white/5 flex items-center justify-center gap-2">
                <Phone size={18} /> Ver Localização
              </button>
            </div>
          </div>

          <div className="bg-surface p-8 rounded-[40px] border border-white/5 space-y-6">
             <h3 className="font-bold flex items-center gap-2 text-gold"><TrendingUp size={18} /> Performance Lojista</h3>
             <div className="space-y-4">
                <ProgressItem label="Taxa de Resposta" value="98%" />
                <ProgressItem label="Satisfação Pós-Venda" value="95%" />
                <ProgressItem label="Garantia Própria" value="Ativa" />
             </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="bg-surface p-6 rounded-3xl border border-white/5">
              <h3 className="font-bold mb-6">Filtrar Estoque</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input type="text" placeholder="Buscar no estoque..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-accent" />
                </div>
                {/* Simplified filters for profile */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ano</p>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs outline-none"><option>Todos</option></select>
                </div>
              </div>
            </div>
            
            <div className="bg-surface p-6 rounded-3xl border border-white/5">
              <h3 className="font-bold mb-4">Sobre a Loja</h3>
              <p className="text-xs text-white/40 leading-relaxed mb-6">
                Especializada em veículos Euro-Premium com mais de 15 anos no mercado de luxo. 
                Oferecemos as melhores taxas e avaliação justa no seu seminovo.
              </p>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span>Aberto hoje</span><span className="text-white font-medium">09:00 - 19:00</span></div>
                <div className="flex justify-between"><span>Carros em estoque</span><span className="text-white font-medium">42</span></div>
              </div>
            </div>
          </aside>

          {/* Dealer Stock */}
          <main className="lg:col-span-9 space-y-8">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Estoque Disponível <span className="text-white/20 text-lg font-light ml-2">42</span></h2>
                <select className="bg-surface border border-white/5 rounded-xl py-2 px-4 text-xs outline-none">
                  <option>Ordenar por preço</option>
                </select>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="premium-card group">
                    <div className="relative h-48 overflow-hidden">
                      <img src={`https://images.unsplash.com/photo-${1555215695 + i}?auto=format&fit=crop&q=80&w=600`} className="w-full h-full object-cover group-hover:scale-105 transition-all" alt="Car" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm mb-1">Mercedes-Benz G63 AMG</h4>
                      <p className="text-[10px] text-white/40 mb-4 uppercase">2023 • Black Edition</p>
                      <div className="flex items-center justify-between">
                         <span className="font-bold text-accent">{formatCurrency(1890000)}</span>
                         <Link to="/veiculo/1" className="text-[10px] font-bold uppercase text-white/40 hover:text-accent transition-colors">Detalhes</Link>
                      </div>
                    </div>
                  </div>
               ))}
             </div>
             
             <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold hover:bg-white/10 transition-all">
                Carregar mais veículos
             </button>

             <div className="space-y-8 pt-12 border-t border-white/5">
                <h2 className="text-2xl font-bold">Avaliações Verificadas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <ReviewItem name="Carlos Eduardo" text="Excelente atendimento. O carro estava impecável conforme anunciado. Todo o processo de documentação foi muito rápido." date="Há 2 semanas" />
                   <ReviewItem name="Patrícia Lima" text="Segunda compra que faço com a Stuttgart. Confiança total na procedência dos veículos." date="Há 1 mês" />
                </div>
             </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ProgressItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
          <span>{label}</span>
          <span className="text-white">{value}</span>
       </div>
       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="bg-gold h-full w-[90%]" />
       </div>
    </div>
  );
}

function ReviewItem({ name, text, date }: any) {
  return (
    <div className="bg-surface p-8 rounded-[32px] border border-white/5 space-y-4">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-bold text-xs">{name[0]}</div>
             <div>
                <p className="font-bold text-sm">{name}</p>
                <div className="flex gap-0.5"><Star size={10} className="text-gold fill-gold" /> <Star size={10} className="text-gold fill-gold" /> <Star size={10} className="text-gold fill-gold" /> <Star size={10} className="text-gold fill-gold" /> <Star size={10} className="text-gold fill-gold" /></div>
             </div>
          </div>
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{date}</span>
       </div>
       <p className="text-xs text-white/60 leading-relaxed italic">"{text}"</p>
    </div>
  );
}
