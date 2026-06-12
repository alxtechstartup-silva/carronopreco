import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Camera, FileText, CheckCircle, 
  ChevronRight, ChevronLeft, Sparkles, Loader2 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fraudService } from '../services/fraudService';
import { useAuth } from '../components/providers/AuthProvider';
import { handleSupabaseError, OperationType } from '../lib/supabase-errors';
import ImageUpload from '../components/common/ImageUpload';

export default function SellCar() {
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fraudWarning, setFraudWarning] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    km: '',
    price: '',
    description: '',
  });

  const finish = async () => {
    if (!user) {
      login();
      return;
    }

    setLoading(true);
    try {
      const analysis = await fraudService.analyzeListing(formData);
      if (analysis.isFraudulent) {
        setFraudWarning(`Sistema antifraude detectou irregularidades: ${analysis.anomalies.join(' | ')}`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('vehicles').insert({
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        km: Number(formData.km),
        price: Number(formData.price.replace(/\D/g, '')),
        description: formData.description,
        ownerId: user.id,
        dealerId: user.id, // compatibility
        status: 'active',
        createdAt: new Date().toISOString(),
        images: uploadedImages.length > 0 ? uploadedImages : [
          `https://images.unsplash.com/photo-1542362567-b0526a626c11?auto=format&fit=crop&q=80&w=800`
        ]
      });

      if (error) throw error;

      setStep(4);
    } catch (error) {
      handleSupabaseError(error, OperationType.CREATE, 'vehicles');
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    setLoading(true);
    // Simulate AI Generation
    setTimeout(() => {
      setFormData({
        ...formData,
        description: `Espetacular ${formData.brand} ${formData.model} ${formData.year}. Veículo em estado de novo, com apenas ${formData.km} km rodados. Completo com todos os opcionais de fábrica, revisado recentemente e pronto para entrega. Oportunidade única para quem busca performance e sofisticação.`
      });
      setLoading(false);
    }, 1500);
  };

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Anuncie seu Veículo</h1>
        <div className="flex items-center justify-center gap-4">
           {[1, 2, 3].map(i => (
             <div key={i} className={`h-1.5 w-16 rounded-full transition-all ${step >= i ? 'bg-accent' : 'bg-white/10'}`} />
           ))}
        </div>
      </div>

      <div className="bg-surface p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
               key="step1"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
            >
               <h2 className="text-2xl font-bold flex items-center gap-3"><Car className="text-accent" /> Dados Básicos</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Marca" value={formData.brand} onChange={v => setFormData({...formData, brand: v})} placeholder="Ex: Porsche" />
                  <Input label="Modelo" value={formData.model} onChange={v => setFormData({...formData, model: v})} placeholder="Ex: Cayenne" />
                  <Input label="Ano" value={formData.year} onChange={v => setFormData({...formData, year: v})} placeholder="2024" />
                  <Input label="Quilometragem" value={formData.km} onChange={v => setFormData({...formData, km: v})} placeholder="0" />
               </div>
               <button onClick={next} className="w-full h-14 bg-accent rounded-2xl font-bold flex items-center justify-center gap-2 group">
                  Próximo Passo <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
               key="step2"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
            >
               <h2 className="text-2xl font-bold flex items-center gap-3"><Camera className="text-accent" /> Fotos & Preço</h2>
               
               <ImageUpload onImagesReady={(urls) => setUploadedImages(urls)} maxFiles={4} />

               <Input label="Preço Sugerido (R$)" value={formData.price} onChange={v => setFormData({...formData, price: v})} placeholder="950.000" />
               <div className="flex gap-4">
                  <button onClick={prev} className="flex-1 h-14 bg-white/5 rounded-2xl font-bold border border-white/5">Voltar</button>
                  <button onClick={next} className="flex-[2] h-14 bg-accent rounded-2xl font-bold flex items-center justify-center gap-2">Próximo Passo <ChevronRight size={18} /></button>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
               key="step3"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
            >
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-3"><FileText className="text-accent" /> Descrição</h2>
                  <button 
                    onClick={generateAI}
                    disabled={loading}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-4 py-2 rounded-lg hover:bg-accent/20 transition-all"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <><Sparkles size={14} /> Gerar com IA</>}
                  </button>
               </div>
               <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva os detalhes, opcionais e estado de conservação..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-accent h-64 text-sm resize-none"
               />
               <div className="flex gap-4">
                  <button onClick={prev} className="flex-1 h-14 bg-white/5 rounded-2xl font-bold border border-white/5">Voltar</button>
                  <button 
                    onClick={finish}
                    disabled={loading}
                    className="flex-[2] h-14 bg-accent rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                  >
                     {loading ? <Loader2 className="animate-spin" /> : <>Finalizar Anúncio <CheckCircle size={18} /></>}
                  </button>
               </div>
               {fraudWarning && <p className="text-red-500 text-xs mt-4 text-center font-bold">{fraudWarning}</p>}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
               key="step4"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="text-center py-12 space-y-6"
            >
               <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={40} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-3xl font-bold">Anúncio Publicado!</h3>
                  <p className="text-white/40">Seu {formData.brand} {formData.model} já está visível para milhares de compradores elite.</p>
               </div>
               <div className="pt-6 flex gap-4 justify-center">
                  <button className="bg-accent text-white px-8 py-3 rounded-xl font-bold text-sm">Ver Meu Anúncio</button>
                  <button className="bg-white/5 px-8 py-3 rounded-xl font-bold text-sm border border-white/5">Ir para Dashboard</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">{label}</label>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-14 bg-white/5 border border-white/10 rounded-2x border border-white/10 rounded-2xl px-6 outline-none focus:border-accent transition-all text-sm"
      />
    </div>
  );
}
