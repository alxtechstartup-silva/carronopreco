import { motion } from 'motion/react';
import { Search, ChevronRight, Clock, User, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: 'Os 5 Carros Elétricos mais esperados para 2026',
      excerpt: 'Conheça as promessas tecnológicas que devem mudar o mercado automotivo brasileiro nos próximos meses.',
      category: 'Novidades',
      date: '19 Mai 2026',
      author: 'Gustavo Mendonça',
      img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 2,
      title: 'Por que o Porsche 911 ainda é o melhor investimento?',
      excerpt: 'Analise histórica de valorização do ícone da Porsche no mercado secundário.',
      category: 'Mercado',
      date: '17 Mai 2026',
      author: 'Clara Silva',
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 3,
      title: 'Guia de Manutenção: Blindagem Nível III-A',
      excerpt: 'Tudo o que você precisa saber para manter seu veículo blindado seguro e valorizado.',
      category: 'Serviços',
      date: '15 Mai 2026',
      author: 'Roberto Alencar',
      img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center mb-16 space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">Blog <span className="text-accent italic font-display">Premium</span></h1>
        <p className="text-white/40 text-lg">Informação, análises e tendências do mundo automotivo de luxo.</p>
        
        <div className="relative max-w-lg mx-auto">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" />
          <input 
            type="text" 
            placeholder="Pesquisar artigos..." 
            className="w-full bg-surface border border-white/5 rounded-full py-4 pl-16 pr-6 text-sm outline-none focus:border-accent transition-all"
          />
        </div>
      </div>

      {/* Featured Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        <div className="lg:col-span-8 group cursor-pointer">
          <div className="relative h-[500px] rounded-[40px] overflow-hidden mb-6 border border-white/5">
             <img src={posts[0].img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="News" />
             <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
             <div className="absolute bottom-10 left-10 right-10">
                <span className="bg-accent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">{posts[0].category}</span>
                <h2 className="text-4xl font-bold mb-4 group-hover:text-accent transition-colors">{posts[0].title}</h2>
                <div className="flex items-center gap-6 text-xs text-white/60">
                   <span className="flex items-center gap-2"><Clock size={14} /> {posts[0].date}</span>
                   <span className="flex items-center gap-2"><User size={14} /> {posts[0].author}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <h3 className="text-xl font-bold border-b border-white/5 pb-4">Mais lidas</h3>
          {posts.slice(1).map((post) => (
             <div key={post.id} className="flex gap-4 group cursor-pointer">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/5 shrink-0">
                   <img src={post.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-2">
                   <span className="text-[10px] text-accent font-bold uppercase">{post.category}</span>
                   <h4 className="font-bold text-sm leading-snug group-hover:text-accent transition-colors">{post.title}</h4>
                   <p className="text-[10px] text-white/40">{post.date}</p>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex flex-wrap gap-4 justify-center mb-16">
        {['Todos', 'Mercado', 'Elon Musk', 'Super Carros', 'Manutenção', 'Classificações'].map((cat) => (
           <button key={cat} className="px-6 py-2 rounded-full border border-white/5 bg-surface text-xs font-bold hover:bg-accent hover:text-white transition-all">
             {cat}
           </button>
        ))}
      </div>

      {/* Grid Feed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="space-y-6 group cursor-pointer">
             <div className="relative h-64 rounded-[32px] overflow-hidden border border-white/5">
                <img src={`https://images.unsplash.com/photo-${1492144534655 + i}?auto=format&fit=crop&q=80&w=600`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="News" />
                <button className="absolute top-6 right-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-accent transition-colors">
                   <Bookmark size={18} />
                </button>
             </div>
             <div className="space-y-3">
                <span className="text-[10px] text-accent font-bold uppercase">Novidades</span>
                <h3 className="text-xl font-bold leading-tight group-hover:text-accent transition-colors">A evolução dos motores V12 na era híbrida: O que sobrou?</h3>
                <p className="text-sm text-white/40 line-clamp-2">Exploramos como a Ferrari e a Lamborghini estão mantendo a alma dos seus motores mais potentes viva...</p>
                <Link to="#" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white pt-2">
                   Ler Artigo <ChevronRight size={14} />
                </Link>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
