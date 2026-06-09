import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Github, Chrome, ArrowRight, Car } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface p-10 rounded-[40px] border border-white/5 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-accent/20">
            <Car className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-white/40 text-sm">
            {mode === 'login' ? 'Acesse seu painel premium agora.' : 'Comece sua jornada no mercado de elite.'}
          </p>
        </div>

        <div className="space-y-4">
          <button className="w-full bg-white text-primary h-14 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all">
            <Chrome size={20} /> Login com Google
          </button>
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[10px] font-bold uppercase text-white/20">ou com e-mail</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email" 
                placeholder="exemplo@email.com"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 focus:border-accent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 focus:border-accent outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="text-right">
              <button className="text-[10px] font-bold uppercase text-white/20 hover:text-accent transition-colors">Esqueceu a senha?</button>
            </div>
          )}

          <button className="w-full bg-accent h-14 rounded-2xl font-bold text-white shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all flex items-center justify-center gap-2 group">
            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center">
           <button 
             onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
             className="text-sm text-white/40 hover:text-white transition-colors"
           >
             {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
