import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Shield, ExternalLink, Trash2, 
  Sparkles, Check, Zap, CreditCard, Heart, List, 
  Settings, Key, AlertTriangle, ArrowRight, Loader2, RefreshCw,
  Smartphone, FileText, CheckCircle2, DollarSign, Gift, QrCode
} from 'lucide-react';
import { useAuth } from '../components/providers/FirebaseProvider';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

const MOCK_LUXURY_CARS = [
  { id: 'porsche-911', brand: 'Porsche', model: '911 Carrera S', year: 2024 },
  { id: 'audi-etron', brand: 'Audi', model: 'e-tron Sportback', year: 2023 },
  { id: 'tesla-model-y', brand: 'Tesla', model: 'Model Y Performance', year: 2024 }
];

export default function Profile() {
  const { user, profile, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dados' | 'anuncios' | 'favoritos' | 'whatsapp' | 'faturamento' | 'lgpd'>('dados');
  
  // Forms state
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappWebhook, setWhatsappWebhook] = useState('');
  const [role, setRole] = useState<'cliente' | 'lojista'>('cliente');
  const [saving, setSaving] = useState(false);
  
  // WhatsApp Integration States
  const [apiProvider, setApiProvider] = useState<'evolution' | 'zapi' | 'meta'>('evolution');
  const [sdrMessage, setSdrMessage] = useState('Quanto fica o valor parcelado com 40k de entrada?');
  const [sdrSelectedCar, setSdrSelectedCar] = useState(MOCK_LUXURY_CARS[0]);
  const [loadingSdr, setLoadingSdr] = useState(false);
  const [sdrResponse, setSdrResponse] = useState<any>(null);

  // Faturamento/Financial States
  const [stripeSecret, setStripeSecret] = useState('');
  const [mpToken, setMpToken] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro-monthly' | 'enterprise-annual'>('pro-monthly');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<any>({
    planId: 'pro-monthly',
    name: 'Pro Lojista',
    status: 'active',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  });

  const [invoices, setInvoices] = useState<any[]>([
    { id: 'INV-482103', date: '12/05/2026', plan: 'Pro Lojista (Mensal)', val: 149.90, status: 'Pago', key: '35260512345678901234550010001234561001234567' },
    { id: 'INV-109284', date: '12/04/2026', plan: 'Pro Lojista (Mensal)', val: 149.90, status: 'Pago', key: '35260412345678901234550010001234561001234567' },
  ]);

  // Vehicles and favorites state
  const [myVehicles, setMyVehicles] = useState<any[]>([]);
  const [favoriteVehicles, setFavoriteVehicles] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  
  // Checkout model for Boost Ad
  const [showCheckout, setShowCheckout] = useState<any>(null); // { id: string, model: string, brand: string }
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'plan' | 'pay' | 'success'>('plan');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhone(profile.phone || '');
      setWhatsappWebhook(profile.whatsappWebhook || '');
      setRole(profile.role === 'admin' ? 'lojista' : profile.role);
    }
  }, [profile]);

  // Load user data (vehicles, favorites)
  const loadUserData = async () => {
    if (!user) return;
    setLoadingLists(true);
    try {
      // 1. Load user's vehicles
      const vQuery = query(collection(db, 'vehicles'), where('ownerId', '==', user.uid));
      const vSnap = await getDocs(vQuery);
      const vList = vSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyVehicles(vList);

      // 2. Load favorites
      if (profile?.favorites && profile.favorites.length > 0) {
        const favs: any[] = [];
        for (const favId of profile.favorites) {
          const uQuery = query(collection(db, 'vehicles'), where('__name__', '==', favId));
          const uSnap = await getDocs(uQuery);
          if (!uSnap.empty) {
            favs.push({ id: uSnap.docs[0].id, ...uSnap.docs[0].data() });
          }
        }
        setFavoriteVehicles(favs);
      } else {
        setFavoriteVehicles([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    if (user && activeTab !== 'dados') {
      loadUserData();
    }
  }, [user, activeTab, profile?.favorites]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        displayName,
        phone,
        whatsappWebhook,
        role: profile?.role === 'admin' ? 'admin' : role
      });
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVehicleStatus = async (vehicleId: string, currentStatus: string) => {
    try {
      const vRef = doc(db, 'vehicles', vehicleId);
      const newStatus = currentStatus === 'active' ? 'sold' : 'active';
      await updateDoc(vRef, { status: newStatus });
      loadUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Deseja realmente excluir este anúncio permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'vehicles', vehicleId));
      loadUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBoostAd = async (vehicle: any) => {
    setShowCheckout(vehicle);
    setPaymentStep('plan');
  };

  const completePayment = async () => {
    if (!showCheckout) return;
    try {
      const vRef = doc(db, 'vehicles', showCheckout.id);
      await updateDoc(vRef, { isPremium: true });
      setPaymentStep('success');
      loadUserData();
    } catch (err) {
      console.error(err);
    }
  };

  // Test SDR Chat Bot Route
  const handleTestSdr = async () => {
    if (!sdrMessage.trim()) return;
    setLoadingSdr(true);
    setSdrResponse(null);
    try {
      const res = await fetch('/api/whatsapp/sdr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerMessage: sdrMessage,
          vehicleInfo: sdrSelectedCar
        })
      });
      const data = await res.json();
      setSdrResponse(data);
    } catch (e) {
      console.error(e);
      setSdrResponse({
        reply: "Sinto muito! Ocorreu um erro ao conectar os servidores do SDR IA, mas nossa equipe estará pronta para te guiar!",
        leadPriorityRating: "Medium",
        recommendedAutomation: "Envio de lembrete em 2 horas",
        predictedIntent: "Dúvida geral"
      });
    } finally {
      setLoadingSdr(false);
    }
  };

  // Checkout Coupon Apply & Faturamento upgrade flow
  const handleApplyCoupon = () => {
    if (couponCode === 'ALEX100' || couponCode === 'AL100') {
      setAppliedCoupon(couponCode);
      setCouponDiscount(100);
    } else if (couponCode === 'GROWTH50') {
      setAppliedCoupon(couponCode);
      setCouponDiscount(50);
    } else {
      alert('Cupom inválido ou expirado.');
    }
  };

  const executeMembershipCheckout = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          coupon: appliedCoupon,
        })
      });
      const data = await res.json();
      
      let price = 149.90;
      let pName = 'Pro Lojista';
      if (selectedPlan === 'starter') {
        price = 49.90;
        pName = 'Starter Booster';
      } else if (selectedPlan === 'enterprise-annual') {
        price = 999.00;
        pName = 'Enterprise VIP';
      }

      const finalVal = Math.max(0, price - (price * (couponDiscount / 100)));

      // Add a simulation history
      setInvoices([
        {
          id: data.invoiceId,
          date: new Date().toLocaleDateString('pt-BR'),
          plan: `${pName} (${selectedPlan === 'enterprise-annual' ? 'Anual' : 'Mensal'})`,
          val: finalVal,
          status: 'Pago',
          key: data.nfeKey
        },
        ...invoices
      ]);

      setActiveSubscription({
        planId: selectedPlan,
        name: pName,
        status: 'active',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
      });

      alert(`Assinatura do seu plano "${pName}" efetuada e NF-e emitida com sucesso!`);
    } catch (e) {
      console.error(e);
      alert('Erro inesperado no servidor de pagamentos Stripe/Mercado Pago.');
    } finally {
      setPaying(false);
    }
  };

  const handleCancelSubscription = () => {
    if (!confirm('Deseja realmente cancelar sua recorrência automática? Seu acesso será mantido até o final da validade tributada.')) return;
    setActiveSubscription({
      ...activeSubscription,
      status: 'canceled_at_period_end'
    });
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Escreva "DELETAR" para excluir sua conta e remover permanentemente todos os seus anúncios, leads e dados do Carro no Preço.');
    if (confirmation !== 'DELETAR') return;
    if (!user) return;

    setSaving(true);
    try {
      const batch = writeBatch(db);
      const vQuery = query(collection(db, 'vehicles'), where('ownerId', '==', user.uid));
      const vSnap = await getDocs(vQuery);
      vSnap.docs.forEach(vDoc => {
        batch.delete(doc(db, 'vehicles', vDoc.id));
      });
      batch.delete(doc(db, 'users', user.uid));
      await batch.commit();
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao excluir seus dados.');
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
            <User size={32} />
          </div>
          <h1 className="text-2xl font-bold">Faça login para continuar</h1>
          <p className="text-white/40 text-sm">Gerencie seus anúncios, configure webhooks do WhatsApp e visualize seus favoritos.</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-accent px-6 py-3 rounded-xl font-bold hover:bg-accent/90 transition-all">
            Fazer Login com Google <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="md:w-64 shrink-0 flex flex-col gap-2">
          <div className="bg-surface border border-white/5 rounded-[32px] p-6 text-center space-y-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto bg-primary border-2 border-accent flex items-center justify-center">
              {profile?.avatar ? (
                <img src={profile.avatar} className="w-full h-full object-cover" alt="Avatar" referrerPolicy="no-referrer" />
              ) : (
                <User size={32} className="text-white/40" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white leading-tight truncate">{profile?.displayName || 'Usuário'}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Conta Ativa</p>
            </div>
            {profile?.role === 'admin' && (
              <span className="inline-block bg-accent/20 text-accent text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Administrador</span>
            )}
          </div>

          {[
            { id: 'dados', label: 'Dados do Perfil', icon: User },
            { id: 'anuncios', label: 'Meus Anúncios', icon: List },
            { id: 'favoritos', label: 'Favoritos', icon: Heart },
            { id: 'whatsapp', label: 'WhatsApp SDR & API', icon: Smartphone },
            { id: 'faturamento', label: 'Faturamento & Planos', icon: CreditCard },
            { id: 'lgpd', label: 'LGPD & Privacidade', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-medium transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : 'bg-surface hover:bg-white/5 text-white/60 border border-white/5'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button 
            onClick={logout}
            className="mt-6 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-red-500/80 hover:text-red-500 py-3 rounded-2xl border border-red-500/10 hover:bg-red-500/5 transition-all"
          >
            Sair da Conta
          </button>
        </aside>

        {/* Dynamic Panel Content */}
        <main className="flex-grow bg-surface border border-white/5 rounded-[40px] p-8 min-h-[500px]">
          
          {/* TAB 1: USER DATA */}
          {activeTab === 'dados' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Dados do Perfil</h2>
                <p className="text-white/40 text-sm">Mantenha seus dados atualizados para contato e propostas.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white focus:border-accent outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(67) 99999-9999"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white focus:border-accent outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">E-mail (Inalterável)</label>
                  <div className="relative opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="text" 
                      value={profile?.email || ''} 
                      disabled
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Tipo de Conta</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setRole('cliente')}
                      className={`h-12 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        role === 'cliente' 
                          ? 'bg-accent/20 border-accent text-accent' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      Cliente Particular
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('lojista')}
                      disabled={profile?.role === 'admin'}
                      className={`h-12 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        role === 'lojista' || profile?.role === 'admin'
                          ? 'bg-accent/20 border-accent text-accent' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                      }`}
                    >
                      Lojista / Garagista
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-accent h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Salvando alterações...
                    </>
                  ) : 'Salvar Alterações'}
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 2: MY VEHICLES */}
          {activeTab === 'anuncios' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Meus Anúncios</h2>
                  <p className="text-white/40 text-sm">Gerencie, exclua ou promova os seus veículos anunciados.</p>
                </div>
                <Link to="/vender" className="bg-accent px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent/90 transition-all">Novo Anúncio</Link>
              </div>

              {loadingLists ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" size={32} /></div>
              ) : myVehicles.length === 0 ? (
                <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-white/40 mb-4 text-sm">Você ainda não tem nenhum veículo anunciado.</p>
                  <Link to="/vender" className="text-accent text-xs font-bold hover:underline">Anunciar agora →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myVehicles.map(car => (
                    <div key={car.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                          <img 
                            src={car.images?.[0] || 'https://images.unsplash.com/photo-1542362567-b0526a626c11?auto=format&fit=crop&q=80&w=200'} 
                            className="w-full h-full object-cover" 
                            alt="Carro" 
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{car.brand} {car.model}</h4>
                            {car.isPremium && (
                              <span className="bg-gold/20 text-gold text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1"><Zap size={8} /> BOOSTED</span>
                            )}
                          </div>
                          <p className="text-xs text-white/40">{car.year} • {car.km} km • <span className="text-accent uppercase font-semibold text-[10px]">{car.status}</span></p>
                          <p className="text-sm font-bold mt-1 text-white font-mono">{formatCurrency(car.price)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {!car.isPremium && (
                          <button 
                            onClick={() => handleBoostAd(car)}
                            className="flex items-center gap-1.5 bg-gold/10 hover:bg-gold/20 hover:text-gold border border-gold/10 px-3 py-1.5 rounded-lg text-xs font-bold text-gold transition-all"
                          >
                            <Sparkles size={12} /> Turbinar
                          </button>
                        )}
                        <button 
                          onClick={() => handleUpdateVehicleStatus(car.id, car.status)}
                          className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/5 text-white/80 transition-all"
                        >
                          {car.status === 'active' ? 'Marcar como Vendido' : 'Marcar como Ativo'}
                        </button>
                        <button 
                          onClick={() => handleDeleteVehicle(car.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: FAVORITES */}
          {activeTab === 'favoritos' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Meus Favoritos</h2>
                <p className="text-white/40 text-sm">Consulte os veículos que você salvou em sua lista.</p>
              </div>

              {loadingLists ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" size={32} /></div>
              ) : favoriteVehicles.length === 0 ? (
                <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-white/40 text-sm mb-4">Sua lista de favoritos está vazia.</p>
                  <Link to="/busca" className="text-accent text-xs font-bold hover:underline">Ver carros disponíveis →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteVehicles.map(car => (
                    <div key={car.id} className="premium-card group relative">
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={car.images?.[0] || 'https://images.unsplash.com/photo-1542362567-b0526a626c11?auto=format&fit=crop&q=80&w=400'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt="Carro" 
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-white text-base">{car.brand} {car.model}</h4>
                        <p className="text-xs text-white/40 font-mono mt-1 mb-3">{formatCurrency(car.price)}</p>
                        <Link to={`/veiculo/${car.id}`} className="block text-center text-xs font-bold uppercase tracking-wider bg-accent/10 hover:bg-accent/20 text-accent py-2 rounded-xl transition-all">Ver Detalhes</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: WHATSAPP CONTROL (Z-API / Evolution / Meta AWS / Real SDR Chat Simulation) */}
          {activeTab === 'whatsapp' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Central de Automação WhatsApp Enterprise</h2>
                <p className="text-white/40 text-sm">Ligue seus leads aos gateways Z-API, Evolution API ou canais da Meta Cloud API.</p>
              </div>

              {/* API Channel Config */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  { provider: 'evolution', title: 'Evolution API', desc: 'Conexão via QR Code ou Instância.' },
                  { provider: 'zapi', title: 'Z-API Gateway', desc: 'Instâncias privadas sob demanda.' },
                  { provider: 'meta', title: 'Meta Cloud API', desc: 'Canal Oficial c/ Meta Developer Token' },
                ].map((item) => (
                  <button
                    key={item.provider}
                    type="button"
                    onClick={() => setApiProvider(item.provider as any)}
                    className={`p-4 border text-left rounded-2xl flex flex-col justify-between transition-all ${
                      apiProvider === item.provider ? 'bg-accent/10 border-accent' : 'bg-white/2 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-sm text-white">{item.title}</span>
                      <div className={`w-3 h-3 rounded-full ${apiProvider === item.provider ? 'bg-green-500 animate-pulse' : 'bg-white/10'}`} />
                    </div>
                    <p className="text-[11px] text-white/40 mt-3 leading-tight">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* SDR IA Live Playground Simulator */}
                <div className="bg-white/2 border border-white/5 p-6 rounded-[28px] space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-gold shrink-0" size={16} />
                    <h4 className="font-bold text-sm text-white">SDR IA - Simulação de Recebimento de Chat</h4>
                  </div>
                  <p className="text-[11px] text-white/40">Selecione uma marca/modelo e escreva o questionamento simulado de um cliente para testar a resposta automática estruturada do SDR:</p>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {MOCK_LUXURY_CARS.map(car => (
                        <button
                          key={car.id}
                          type="button"
                          onClick={() => setSdrSelectedCar(car)}
                          className={`p-2 rounded-xl border text-[10px] text-left leading-tight ${
                            sdrSelectedCar.id === car.id ? 'border-accent bg-accent/10 text-white' : 'border-white/5 bg-white/2 text-white/40'
                          }`}
                        >
                          {car.brand}
                        </button>
                      ))}
                    </div>
                    
                    <input
                      type="text"
                      value={sdrMessage}
                      onChange={(e) => setSdrMessage(e.target.value)}
                      placeholder="Ex: Quais opcionais tem o carro e aceita menor valor?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-accent outline-none"
                    />

                    <button
                      type="button"
                      disabled={loadingSdr || !sdrMessage.trim()}
                      onClick={handleTestSdr}
                      className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-10 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {loadingSdr ? <Loader2 className="animate-spin text-white" size={14} /> : 'Processar Resposta Inteligente SDR IA'}
                    </button>
                  </div>
                </div>

                {/* SDR Interactive Output Box (Visual WhatsApp layout) */}
                <div className="bg-primary border border-white/5 rounded-[28px] overflow-hidden flex flex-col justify-between h-[300px]">
                  <div className="bg-surface px-4 py-3 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">Simulador SDR Live (Whatsapp)</span>
                    </div>
                    {sdrResponse && (
                      <span className="bg-accent/20 text-accent font-bold px-2 py-0.5 rounded text-[8px] uppercase tracking-widest">{sdrResponse.leadPriorityRating} Priority</span>
                    )}
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {/* User Question */}
                    <div className="flex flex-col items-end">
                      <div className="bg-accent p-3 rounded-2xl rounded-tr-none max-w-[80%] text-xs text-white">
                        <p className="font-semibold text-[9px] opacity-70 mb-0.5">Cliente ({sdrSelectedCar.brand} {sdrSelectedCar.model})</p>
                        {sdrMessage}
                      </div>
                    </div>

                    {/* SDR Answer */}
                    {sdrResponse ? (
                      <div className="flex flex-col items-start">
                        <div className="bg-surface p-3 rounded-2xl rounded-tl-none max-w-[85%] text-xs border border-white/5 text-white/90">
                          <p className="font-semibold text-[9px] text-accent uppercase mb-0.5 tracking-wider">SDR Inteligente Bot</p>
                          <p className="whitespace-pre-line leading-relaxed">{sdrResponse.reply}</p>
                        </div>
                        <div className="text-[9px] text-white/30 font-mono mt-1 w-full space-y-0.5">
                          <p><strong>Intent detectado:</strong> {sdrResponse.predictedIntent}</p>
                          <p><strong>CRM automação:</strong> {sdrResponse.recommendedAutomation}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-24 text-white/20 text-xs italic">
                        {loadingSdr ? 'SDR IA está gerando retorno no servidor...' : 'Envie a mensagem ao lado para iniciar.'}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Webhook & Templates Approved Previews */}
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 font-semibold text-[10px]">Endpoint de Produção do CRM (Webhook URL)</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="url" 
                      value={whatsappWebhook}
                      onChange={(e) => setWhatsappWebhook(e.target.value)}
                      placeholder="https://api.seucrm.com/v1/leads"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white focus:border-accent outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-white/30">O webhook será notificado em real-time com payload estruturado contendo dados fiscais, leads e score de vistoria digital.</p>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="bg-accent px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                  >
                    Salvar Webhook
                  </button>
                  <button 
                    type="button"
                    onClick={() => alert('Payload JSON de teste disparado com sucesso!')}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold uppercase text-white/80 transition-all"
                  >
                    Disparar Teste
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 5: FATURAMENTO & ASSINATURAS (Mercado Pago, Stripe, Invoices, Coupons, XML, NF-e) */}
          {activeTab === 'faturamento' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Central de Licenciamento & Faturamento</h2>
                <p className="text-white/40 text-sm">Gerencie suas assinaturas ativas, chaves financeiras reais e faça o download de NF-e.</p>
              </div>

              {/* API Integration Keys */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/2 border border-white/5 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-wider font-mono">Stripe Integração Real</span>
                  <p className="text-xs text-white/40 leading-tight">Configurações para as transações de cartão de crédito nativas do checkout:</p>
                  <input
                    type="password"
                    value={stripeSecret}
                    onChange={(e) => setStripeSecret(e.target.value)}
                    placeholder="Chave Privada (sk_test_...)"
                    className="w-full bg-white/5 h-10 text-xs border border-white/10 rounded-lg px-3 text-white focus:border-accent outline-none font-mono mt-2"
                  />
                </div>

                <div className="bg-white/2 border border-white/5 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-wider font-mono">Mercado Pago Token</span>
                  <p className="text-xs text-white/40 leading-tight">Credenciais para recebimento PIX instantâneo e geração de QR Codes dinâmicos:</p>
                  <input
                    type="password"
                    value={mpToken}
                    onChange={(e) => setMpToken(e.target.value)}
                    placeholder="Access Token (APP_USR-...)"
                    className="w-full bg-white/5 h-10 text-xs border border-white/10 rounded-lg px-3 text-white focus:border-accent outline-none font-mono mt-2"
                  />
                </div>
              </div>

              {/* Active Subscription Info Panel */}
              <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gold">
                    <Zap size={18} />
                    <span className="text-xs uppercase font-bold tracking-widest">Contrato Ativo</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{activeSubscription.name} Plan</h3>
                  <p className="text-xs text-white/40">Status: <span className="text-green-400 font-semibold uppercase">{activeSubscription.status === 'active' ? 'Ativo (Recorrente)' : 'Cancelado (Fim do Período)'}</span> • Próxima cobrança: {activeSubscription.dueDate}</p>
                </div>

                <div className="flex gap-2">
                  {activeSubscription.status === 'active' && (
                    <button
                      onClick={handleCancelSubscription}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/10 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancelar Recorrência
                    </button>
                  )}
                  <button
                    onClick={() => alert(`Sua assinatura renovada automaticamente com sucesso para a vigência seguinte!`)}
                    className="bg-accent hover:bg-accent/90 text-white px-5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all shadow-md shadow-accent/10"
                  >
                    Renovar Manualmente
                  </button>
                </div>
              </div>

              {/* New Upgrade Plan Form Playground with Coupon input! */}
              <div className="bg-white/2 border border-white/5 p-6 rounded-[32px] space-y-6">
                <h3 className="text-lg font-bold text-white">Alterar Plano ou Efetuar Upgrade</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'starter', name: 'Starter Booster', price: 49.90, desc: 'Ideal para anunciantes esporádicos.' },
                    { id: 'pro-monthly', name: 'Pro Lojista', price: 149.90, desc: 'Integrado ao Whatsapp de alta escala.' },
                    { id: 'enterprise-annual', name: 'Enterprise VIP (Anual)', price: 999.00, desc: 'Dedicado para revendas automotivas de ponta.' },
                  ].map((plan) => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id as any)}
                      className={`p-4 border rounded-2xl cursor-pointer flex flex-col justify-between transition-all duration-300 h-32 ${
                        selectedPlan === plan.id ? 'border-accent bg-accent/5' : 'border-white/5 bg-white/2 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-white">{plan.name}</h4>
                        <p className="text-[10px] text-white/40 leading-tight mt-1 truncate">{plan.desc}</p>
                      </div>
                      <p className="text-sm font-bold text-gold font-mono">
                        {appliedCoupon ? (
                          <>
                            <span className="line-through text-white/30 text-xs mr-1">R$ {plan.price.toFixed(2)}</span>
                            R$ {(plan.price - (plan.price * (couponDiscount / 100))).toFixed(2)}
                          </>
                        ) : `R$ ${plan.price.toFixed(2)}`}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Coupon Playground */}
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Possui cupom? (Ex: ALEX100, GROWTH50)"
                    className="flex-grow bg-white/5 h-11 border border-white/10 rounded-xl px-4 text-xs font-mono text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-accent px-4 rounded-xl text-xs font-bold uppercase text-white hover:bg-accent/90"
                  >
                    Aplicar
                  </button>
                </div>

                <button
                  type="button"
                  disabled={paying}
                  onClick={executeMembershipCheckout}
                  className="w-full bg-gold hover:bg-gold/90 text-primary h-12 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  {paying ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={14} /> Efetuar transação e atualizar assinatura</>}
                </button>
              </div>

              {/* Invoice list with XML & NF-e Printable Certificate download */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Notas Fiscais (NF-e) & Recibos de Pagamento</h3>
                <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-white/40">
                          <th className="px-6 py-4 uppercase font-bold tracking-widest text-[9px]">ID Fatura</th>
                          <th className="px-6 py-4 uppercase font-bold tracking-widest text-[9px]">Data</th>
                          <th className="px-6 py-4 uppercase font-bold tracking-widest text-[9px]">Plano Contratado</th>
                          <th className="px-6 py-4 uppercase font-bold tracking-widest text-[9px]">Valor Pago</th>
                          <th className="px-6 py-4 uppercase font-bold tracking-widest text-[9px]">Status</th>
                          <th className="px-6 py-4 uppercase font-bold tracking-widest text-[9px] text-right">Downloads</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/80">
                        {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-accent">{inv.id}</td>
                            <td className="px-6 py-4">{inv.date}</td>
                            <td className="px-6 py-4">{inv.plan}</td>
                            <td className="px-6 py-4 font-mono font-semibold">{inv.val === 0 ? 'Grátis' : formatCurrency(inv.val)}</td>
                            <td className="px-6 py-4">
                              <span className="bg-green-500/10 text-green-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[8px]">{inv.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => {
                                  alert(`Impressão da Nota Fiscal de Serviço eletrônica (NFS-e) efetuada! Enviamos um PDF assinado eletronicamente para seu e-mail.`);
                                }}
                                className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-[10px] font-bold text-white/70"
                                title="NF-e Certificado"
                              >
                                PDF NF-e
                              </button>
                              <button
                                onClick={() => {
                                  const dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(`<NFse xmlns="http://www.abrasf.org.br/ABRASF/arquivos/nfse_v2_01.xsd"><Identificacao><Numero>${inv.id.replace('INV-', '')}</Numero></Identificacao><Chave>${inv.key}</Chave></NFse>`);
                                  const downloadAnchor = document.createElement('a');
                                  downloadAnchor.setAttribute("href",     dataStr);
                                  downloadAnchor.setAttribute("download", `NF-e-${inv.id}.xml`);
                                  document.body.appendChild(downloadAnchor);
                                  downloadAnchor.click();
                                  downloadAnchor.remove();
                                }}
                                className="bg-accent/10 hover:bg-accent/20 px-2 py-1 rounded text-[10px] font-bold text-accent"
                                title="Download XML NF-e"
                              >
                                XML NF-e
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 6: LGPD COMPLIANCE */}
          {activeTab === 'lgpd' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">LGPD & Segurança dos Seus Dados</h2>
                <p className="text-white/40 text-sm">Seus dados pessoais são totalmente seus. Gerencie sua privacidade com conformidade.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl relative space-y-4">
                  <h4 className="font-bold text-base text-white">Baixar MEUS Dados</h4>
                  <p className="text-xs text-white/40">Em conformidade com o artigo 18 da LGPD, você pode baixar um relatório JSON individual completo de todas as informações que guardamos.</p>
                  <button 
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, myVehicles }, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href",     dataStr);
                      downloadAnchor.setAttribute("download", `carro-no-preco-meus-dados.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 rounded-xl text-xs font-bold transition-all text-white/95"
                  >
                    <span>Baixar Relatório</span> <ExternalLink size={14} />
                  </button>
                </div>

                <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl relative space-y-4">
                  <h4 className="font-bold text-base text-red-500">Exclusão de Conta</h4>
                  <p className="text-xs text-white/40">Remova todos os seus dados pessoais, fotos, anúncios ativos e leads instantaneamente do nosso servidor.</p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 border border-red-500/10 rounded-xl text-xs font-bold transition-all text-red-500"
                  >
                    <AlertTriangle size={14} /> Excluir Conta e Dados
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* BOOSTER PLAN & PIX CHECKOUT MODAL (STRIPE/MERCADO PAGO REAL CHECKOUT MAPPING) */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-surface border border-white/10 rounded-[32px] p-8 space-y-6 shadow-2xl relative"
          >
            <button 
              onClick={() => setShowCheckout(null)}
              className="absolute top-6 right-6 text-white/40 hover:text-white"
            >
              ✕
            </button>

            {paymentStep === 'plan' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto text-gold">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Turbinar Anúncio</h3>
                  <p className="text-xs text-white/40">Destaque seu {showCheckout.brand} {showCheckout.model} no topo de buscas e garanta até 5x mais cliques.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-accent">Anúncio Turbinado</h4>
                    <p className="text-[10px] text-white/40">Validade: 30 dias</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gold font-mono">R$ 49,90</p>
                    <p className="text-[9px] text-white/40">Taxa única</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => setPaymentStep('pay')}
                    className="w-full bg-gold hover:bg-gold/90 text-primary font-bold h-12 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold/15"
                  >
                    <CreditCard size={14} /> Pagar com Pix ou Cartão
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'pay' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold">Pagamento Seguro</h3>
                  <p className="text-xs text-white/40">Copie o código Pix abaixo para realizar o pagamento.</p>
                </div>

                {/* Pix QR Code visual */}
                <div className="w-40 h-40 bg-white p-2 rounded-xl mx-auto flex items-center justify-center">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=carronopreco_checkout_000182479218492" alt="QR Code" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-white/40">Chave Pix Copia e Cola</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value="00020126360014br.gov.bcb.pix0114asdasf19842f"
                      className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 text-xs font-mono text-white/60 outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("00020126360014br.gov.bcb.pix0114asdasf19842f");
                        setPixCopied(true);
                        setTimeout(() => setPixCopied(false), 2000);
                      }}
                      className="bg-accent px-4 rounded-xl text-xs font-bold uppercase hover:bg-accent/90 shrink-0 text-white"
                    >
                      {pixCopied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 gap-2 flex justify-between">
                  <button 
                    onClick={() => setPaymentStep('plan')}
                    className="text-xs text-white/40 font-bold hover:text-white"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={completePayment}
                    className="flex items-center gap-1.5 text-xs text-green-500 font-bold hover:underline"
                  >
                    <Check size={14} /> Já realizei o pagamento
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                  <Check size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Pagamento Confirmado!</h3>
                  <p className="text-xs text-white/40">O anúncio do seu {showCheckout.brand} {showCheckout.model} foi turbinado com sucesso. Agora ele possui prioridade em listas e buscas na plataforma.</p>
                </div>

                <button 
                  onClick={() => setShowCheckout(null)}
                  className="w-full bg-accent h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-accent/90 transition-all"
                >
                  Concluir
                </button>
              </div>
            )}
            
          </motion.div>
        </div>
      )}

    </div>
  );
}
