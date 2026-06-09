import { motion } from 'motion/react';
import { X, Search, ChevronRight, Zap, Target } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Compare() {
  const cars = [
    {
      id: 1,
      name: 'BMW M4 Competition',
      img: 'https://images.unsplash.com/photo-1542362567-b0526a626c11?auto=format&fit=crop&q=80&w=400',
      price: 789000,
      year: 2024,
      power: '510 cv',
      torque: '650 Nm',
      zero100: '3.9s',
      consumption: '10.2 km/l'
    },
    {
      id: 2,
      name: 'Audi RS5 Coupé',
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400',
      price: 755000,
      year: 2024,
      power: '450 cv',
      torque: '600 Nm',
      zero100: '4.1s',
      consumption: '9.8 km/l'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-12">Comparador <span className="text-accent italic font-display">Elite</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Column 1: Labels */}
        <div className="hidden md:block pt-96 space-y-12">
           <ComparisonLabel label="Preço Sugerido" />
           <ComparisonLabel label="Ano Modelo" />
           <ComparisonLabel label="Potência Máxima" />
           <ComparisonLabel label="Torque" />
           <ComparisonLabel label="0 a 100 km/h" />
           <ComparisonLabel label="Consumo Combinado" />
        </div>

        {/* Dynamic Columns */}
        {cars.map((car, idx) => (
           <div key={car.id} className="bg-surface rounded-3xl border border-white/5 overflow-hidden group relative">
              <button className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-red-500/20 text-white hover:text-red-500 rounded-full transition-all z-10">
                 <X size={18} />
              </button>
              
              <div className="h-64 overflow-hidden relative">
                 <img src={car.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={car.name} />
                 <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              </div>

              <div className="p-8 space-y-12">
                 <div className="h-20">
                    <h3 className="text-xl font-bold mb-1">{car.name}</h3>
                    <p className="text-accent font-bold">{formatCurrency(car.price)}</p>
                 </div>

                 <div className="md:hidden pt-4 border-t border-white/5 space-y-8">
                    <ComparisonValue label="Preço" value={formatCurrency(car.price)} />
                    <ComparisonValue label="Ano" value={car.year} />
                    <ComparisonValue label="Potência" value={car.power} />
                    <ComparisonValue label="Torque" value={car.torque} />
                    <ComparisonValue label="Desempenho" value={car.zero100} />
                    <ComparisonValue label="Consumo" value={car.consumption} />
                 </div>

                 <div className="hidden md:flex flex-col gap-12">
                    <span className="text-lg font-medium">{car.year}</span>
                    <span className="text-lg font-medium">{car.power}</span>
                    <span className="text-lg font-medium">{car.torque}</span>
                    <span className="text-lg font-medium text-accent">{car.zero100}</span>
                    <span className="text-lg font-medium">{car.consumption}</span>
                 </div>

                 <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all group-hover:border-accent">
                    Ver Detalhes
                 </button>
              </div>
           </div>
        ))}

        {/* Add Car Column */}
        <div className="h-full min-h-[600px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center space-y-6 hover:border-accent/40 transition-all cursor-pointer group">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover:bg-accent/10 group-hover:text-accent transition-all">
              <Search size={32} />
           </div>
           <div>
              <h4 className="font-bold mb-2">Adicionar Veículo</h4>
              <p className="text-xs text-white/40">Selecione outro modelo para comparar performance e custo-benefício.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonLabel({ label }: { label: string }) {
   return (
      <div className="h-6 flex items-center">
         <span className="text-sm font-bold uppercase tracking-widest text-white/20">{label}</span>
      </div>
   );
}

function ComparisonValue({ label, value }: { label: string, value: string | number }) {
   return (
      <div className="flex justify-between items-center">
         <span className="text-xs font-bold uppercase tracking-widest text-white/20">{label}</span>
         <span className="font-bold">{value}</span>
      </div>
   );
}
