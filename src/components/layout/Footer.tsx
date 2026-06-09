import { Car, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Car className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">Carro no Preço</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              Encontrando o valor real do seu próximo veículo com inteligência artificial e transparência total.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-accent transition-colors"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-accent transition-colors"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-accent transition-colors"><Twitter size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Marketplace</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link to="/busca" className="hover:text-white transition-colors">Comprar Carros</Link></li>
              <li><Link to="/vender" className="hover:text-white transition-colors">Vender meu Carro</Link></li>
              <li><Link to="/fipe" className="hover:text-white transition-colors">Tabela Fipe</Link></li>
              <li><Link to="/financiamento" className="hover:text-white transition-colors">Simulador de Crédito</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Carro no Preço</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link to="/sobre" className="hover:text-white transition-colors">Nossa História</Link></li>
              <li><Link to="/lojas" className="hover:text-white transition-colors">Lojistas Parceiros</Link></li>
              <li><Link to="/contato" className="hover:text-white transition-colors">Fale Conosco</Link></li>
              <li><Link to="/trabalhe-conosco" className="hover:text-white transition-colors">Carreiras</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold">Contato</h4>
            <div className="space-y-4">
              <div className="flex gap-3 text-sm text-white/40">
                <Mail size={18} className="text-accent" />
                <span>contato@carronopreco.com.br</span>
              </div>
              <div className="flex gap-3 text-sm text-white/40">
                <Phone size={18} className="text-accent" />
                <span>0800 555 1234</span>
              </div>
              <div className="flex gap-3 text-sm text-white/40">
                <MapPin size={18} className="text-accent" />
                <span>Av. Faria Lima, 4500 - São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">© 2026 Carro no Preço S.A. Todos os direitos reservados. CNPJ: 00.123.456/0001-00</p>
          <div className="flex gap-6 text-xs text-white/20">
            <Link to="/privacidade" className="hover:text-white">Privacidade</Link>
            <Link to="/termos" className="hover:text-white">Termos de Uso</Link>
            <Link to="/cookies" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
