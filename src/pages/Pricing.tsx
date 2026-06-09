import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Target, Star, ShieldCheck, Loader2 } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Essencial',
    price: 'R$ 0',
    desc: 'Ideal para vendedores ocasionais.',
    features: ['Até 3 veículos', 'Fotos padrão', 'Leads via e-mail', 'Dashboard básico'],
    accent: 'white/10'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 'R$ 299',
    desc: 'Para lojas em crescimento.',
    features: ['Até 50 veículos', 'Selo Verificado', 'Leads Ilimitados', 'AI Lead Scoring', 'Suporte 24h'],
    accent: 'accent',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Elite Enterprise',
    price: 'R$ 899',
    desc: 'Escalabilidade máxima e branding.',
    features: ['Veículos ilimitados', 'Destaque na Home', 'Vídeos 360', 'Integração CRM/API', 'Account Manager'],
    accent: 'gold'
  }
];

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      const { clientSecret } = await res.json();
      // Simulate redirect to checkout
      setTimeout(() => {
        alert(`Checkout simulado iniciado! ID: ${clientSecret}`);
        setLoading(null);
      }, 1500);
    } catch (e) {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Escalabilidade para seu <br /> <span className="text-accent italic font-display">Negócio</span></h1>
        <p className="text-white/40 text-lg">Escolha o plano que melhor se adapta ao volume do seu estoque e acelere suas vendas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`relative bg-surface p-10 rounded-[40px] border border-white/5 flex flex-col justify-between overflow-hidden group ${plan.popular ? 'border-accent/40 shadow-2xl shadow-accent/10' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 right-10 bg-accent text-white px-4 py-1 rounded-b-xl text-[10px] font-bold uppercase tracking-widest">
                Mais Popular
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${plan.id === 'enterprise' ? 'text-gold' : ''}`}>{plan.name}</h3>
                <p className="text-white/40 text-sm">{plan.desc}</p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/20 text-sm">/mês</span>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-white/60">
                    <Check size={16} className="text-accent" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              disabled={!!loading}
              onClick={() => handleSubscribe(plan.id)}
              className={`w-full mt-10 h-14 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                plan.popular 
                ? 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20' 
                : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {loading === plan.id ? <Loader2 className="animate-spin" /> : 'Selecionar Plano'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 bg-white/5 rounded-[40px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-accent" /> Garantia de Conversão</h3>
          <p className="text-white/40 text-sm">Cancele a qualquer momento. Sem fidelidade ou taxas ocultas.</p>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-accent">+150%</span>
              <span className="text-[10px] text-white/40 uppercase font-bold">Mais Leads</span>
           </div>
           <div className="w-px h-10 bg-white/10"></div>
           <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-accent">15 min</span>
              <span className="text-[10px] text-white/40 uppercase font-bold">Setup Médio</span>
           </div>
        </div>
      </div>
    </div>
  );
}
