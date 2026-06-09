import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, FileText, Smartphone, Fingerprint, 
  CheckCircle, Loader2, ShieldCheck, Zap, ArrowRight, Camera 
} from 'lucide-react';

export default function Financing() {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);

  const startAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setStep(3);
    }, 4000);
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-5xl">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Financiamento <span className="text-accent">Open Finance</span></h1>
        <p className="text-white/40">Aprovação real em tempo real conectada com os principais bancos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8">
          <div className="bg-surface p-12 rounded-[48px] border border-white/5 shadow-2xl min-h-[500px] flex flex-col">
             <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 flex-1"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                          <Smartphone size={24} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold font-bold">Identidade Digital</h3>
                          <p className="text-sm text-white/40">Escaneie o QR Code ou faça upload do seu CNH/RG.</p>
                       </div>
                    </div>
                    
                    <div className="border-2 border-dashed border-white/10 rounded-[32px] p-12 text-center space-y-4">
                       <FileText size={48} className="mx-auto text-white/20" />
                       <p className="text-sm text-white/40 font-medium">Arraste seus documentos aqui</p>
                    </div>

                    <button onClick={() => setStep(2)} className="w-full bg-accent text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 group mt-auto">
                       Próximo Passo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 flex-1"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                          <Fingerprint size={24} />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold">Validação Biométrica</h3>
                          <p className="text-sm text-white/40">Precisamos de uma selfie para garantir sua segurança.</p>
                       </div>
                    </div>
                    
                    <div className="aspect-video bg-white/5 rounded-[40px] flex items-center justify-center border border-white/5 overflow-hidden relative">
                       <div className="absolute inset-0 bg-accent/5 animate-pulse" />
                       <Camera size={48} className="text-white/20 relative z-10" />
                    </div>

                    <p className="text-[10px] text-white/40 text-center uppercase font-bold tracking-widest px-12">
                      Ao continuar, você autoriza o Carro no Preço a consultar seu score via Open Finance e órgãos de proteção ao crédito.
                    </p>

                    <button 
                      onClick={startAnalysis}
                      disabled={analyzing}
                      className="w-full bg-accent text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 mt-auto"
                    >
                       {analyzing ? <Loader2 className="animate-spin" /> : 'Solicitar Aprovação'}
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8 flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center shadow-2xl">
                       <CheckCircle size={48} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-bold mb-2">Crédito Pré-Aprovado!</h3>
                       <p className="text-white/40">Você tem um limite de até <strong>R$ 450.000,00</strong> com taxas a partir de 0.99% a.m.</p>
                    </div>
                    
                    <div className="w-full grid grid-cols-3 gap-4 pt-8">
                       <Benefit value="12h" label="Validade" />
                       <Benefit value="Fixed" label="Taxas" />
                       <Benefit value="VIP" label="Canal" />
                    </div>

                    <button className="w-full bg-accent text-white h-14 rounded-2xl font-bold shadow-lg shadow-accent/20 mt-8">
                       Falar com Especialista de Crédito
                    </button>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>

        <div className="md:col-span-4 space-y-6 text-sm">
           <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 space-y-6">
              <h4 className="font-bold flex items-center gap-2"><ShieldCheck className="text-accent" /> Bancos Parceiros</h4>
              <div className="grid grid-cols-2 gap-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 text-[10px] font-bold text-white/20 uppercase">Banco 0{i}</div>
                 ))}
              </div>
           </div>

           <div className="bg-accent/10 p-8 rounded-[40px] border border-accent/20 space-y-4">
              <h4 className="font-bold flex items-center gap-2 text-accent"><Zap size={18} /> Por que Open Finance?</h4>
              <p className="text-xs text-accent/70 leading-relaxed font-medium">
                Taxas até 30% menores que o mercado. <br />
                Aprovação 5x mais rápida. <br />
                Processo 100% digital e seguro.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function Benefit({ value, label }: { value: string, label: string }) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
       <p className="text-xl font-bold">{value}</p>
       <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{label}</p>
    </div>
  );
}
