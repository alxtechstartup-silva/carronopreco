import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Search } from 'lucide-react';

export default function SearchIndex() {
  const cities = ['São Paulo', 'Curitiba', 'Rio de Janeiro', 'Florianópolis', 'Belo Horizonte'];
  const brands = ['BMW', 'Porsche', 'Audi', 'Mercedes', 'Tesla', 'Land Rover'];
  const categories = ['SUV', 'Sedan', 'Esportivo', 'Blindado', 'Eletrico'];

  return (
    <div className="bg-surface py-20 border-t border-white/5">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-12 flex items-center gap-2">
          <Search size={24} className="text-accent" /> Explorar por Região e Categoria
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Principais Cidades</h3>
            <ul className="space-y-2 text-sm">
              {cities.map(city => (
                <li key={city}><Link to={`/carros/todos/todas/${city}`} className="hover:text-accent transition-colors">Carros em {city}</Link></li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Marcas Premium</h3>
            <ul className="space-y-2 text-sm">
              {brands.map(brand => (
                <li key={brand}><Link to={`/carros/todos/${brand}`} className="hover:text-accent transition-colors">{brand} à venda</Link></li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Categorias</h3>
            <ul className="space-y-2 text-sm">
              {categories.map(cat => (
                <li key={cat}><Link to={`/carros/${cat}`} className="hover:text-accent transition-colors">{cat} Premium</Link></li>
              ))}
            </ul>
          </div>

          <div className="bg-accent/5 p-6 rounded-3xl border border-accent/20">
            <ShieldCheck className="text-accent mb-4" size={32} />
            <h4 className="font-bold mb-2">Segurança Carro no Preço</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Cada página gerada dinamicamente passa por nossa triagem de qualidade e validação de base real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
