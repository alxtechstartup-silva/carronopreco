import { Link } from 'react-router-dom';
import { Car, Search as SearchIcon, User, Menu, LogOut, Bell, Shield, Heart, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const { user, profile, login, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Real-time Notification listener
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Default notifications for beautiful initialization if none exist yet
    const defaultAlerts = [
      { id: '1', title: 'Carro no Preço Premium', type: 'system', message: 'Bem-vindo ao maior portal de carros premium!', date: 'Agora', read: false },
      { id: '2', title: 'Preço FIPE Integrado', type: 'info', message: 'Consulte os gráficos históricos e compare antes de fechar propostas.', date: '1d atrás', read: true }
    ];

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('userId', user.id);

        if (error) throw error;
        setNotifications(data && data.length > 0 ? data : defaultAlerts);
      } catch (err) {
        setNotifications(defaultAlerts);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('schema-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (!user) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('userId', user.id)
        .eq('read', false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect h-20 border-b border-white/5">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Car className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Carro no <span className="text-accent">Preço</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/busca" className="text-sm font-medium hover:text-accent transition-colors">Comprar</Link>
          <Link to="/vender" className="text-sm font-medium hover:text-accent transition-colors">Vender</Link>
          <Link to="/vistoria" className="text-sm font-medium hover:text-accent transition-colors">Vistoria IA</Link>
          <Link to="/financiamento" className="text-sm font-medium hover:text-accent transition-colors">Crédito</Link>
          <Link to="/planos" className="text-sm font-medium hover:text-accent transition-colors">Planos</Link>
          {profile?.role === 'admin' && (
            <Link to="/dashboard" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <button 
              onClick={login}
              className="flex items-center gap-2 bg-accent px-4 py-2 rounded-full hover:bg-accent/90 transition-all text-white"
            >
              <User size={18} />
              <span className="text-sm font-medium">Entrar</span>
            </button>
          ) : (
            <div className="flex items-center gap-4 relative">
              
              {/* Notification icon */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markAllAsRead();
                  }}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/80 transition-all relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-primary" />
                  )}
                </button>

                {/* Notifications dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-80 bg-surface border border-white/15 rounded-3xl p-4 shadow-2xl space-y-3 z-50 text-left"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Notificações</span>
                        <span className="text-[10px] text-accent font-semibold">{unreadCount} novas</span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className={`p-2.5 rounded-xl transition-all ${n.read ? 'bg-transparent' : 'bg-white/5 border border-white/5'}`}>
                            <div className="flex justify-between items-start gap-1">
                              <span className="text-xs font-bold text-white leading-tight">{n.title}</span>
                              <span className="text-[8px] text-white/40 whitespace-nowrap">{n.date}</span>
                            </div>
                            <p className="text-[10px] text-white/50 mt-1 leading-snug">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar Menu Link */}
              <Link 
                to="/perfil" 
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-accent flex items-center justify-center">
                  {profile?.avatar ? (
                    <img src={profile.avatar} className="w-full h-full object-cover" alt="User" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-white leading-none truncate max-w-24 group-hover:text-accent transition-colors">
                    {profile?.displayName?.split(' ')?.[0] || 'Perfil'}
                  </span>
                  <span className="text-[8px] text-white/40 uppercase tracking-widest leading-none mt-1">
                    {profile?.role || 'Cliente'}
                  </span>
                </div>
              </Link>

              <button 
                onClick={logout}
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all text-white/40 sm:block hidden"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
          <button className="md:hidden">
            <Menu />
          </button>
        </div>
      </div>
    </nav>
  );
}
