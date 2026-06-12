import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Chrome, ArrowRight, Car, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/providers/AuthProvider';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login: googleLogin, user } = useAuth();

  // If already logged in, redirect to profile page
  if (user) {
    setTimeout(() => navigate('/perfil'), 50);
  }

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await googleLogin();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao efetuar login com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        setSuccessMsg('Logado com sucesso! Redirecionando...');
        setTimeout(() => navigate('/perfil'), 1000);
      } else {
        if (!fullName) {
          setErrorMsg('Por favor, preencha seu nome completo.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;

        // If email confirmation is needed or session is created automatically
        if (data.session) {
          setSuccessMsg('Conta criada e logada com sucesso! Redirecionando...');
          // We also trigger profile sync in Supabase
          setTimeout(() => navigate('/perfil'), 1000);
        } else {
          setSuccessMsg('Conta criada! Por favor, verifique sua caixa de entrada para confirmar o e-mail ou faça login.');
          setMode('login');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
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

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-xs text-red-400">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-start gap-3 text-xs text-green-400">
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <p className="leading-relaxed">{successMsg}</p>
          </div>
        )}

        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-primary h-14 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Chrome size={20} /> Login com Google
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[10px] font-bold uppercase text-white/20">ou com e-mail</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Seu Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 focus:border-accent outline-none transition-all text-white text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="email" 
                required
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 focus:border-accent outline-none transition-all text-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 focus:border-accent outline-none transition-all text-white text-sm"
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="text-right">
              <button 
                type="button"
                onClick={async () => {
                  if (!email) {
                    setErrorMsg('Por favor, informe seu e-mail para recuperar a senha.');
                    return;
                  }
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: window.location.origin + '/login'
                    });
                    if (error) throw error;
                    setSuccessMsg('E-mail de recuperação enviado para o endereço informado!');
                  } catch (e: any) {
                    setErrorMsg(e.message || 'Erro ao tentar recuperar a senha.');
                  }
                }}
                className="text-[10px] font-bold uppercase text-white/20 hover:text-accent transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-accent h-14 rounded-2xl font-bold text-white shadow-lg shadow-accent/20 hover:bg-accent/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button 
            type="button"
            disabled={loading}
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
