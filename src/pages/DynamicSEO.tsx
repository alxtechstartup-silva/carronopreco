import { useParams } from 'react-router-dom';
import Search from './Search';
import SEO from '../components/common/SEO';

export default function DynamicSEO() {
  const { category, brand, city } = useParams();
  
  const title = `${category || 'Carros'} ${brand || ''} em ${city || 'todo o Brasil'}`;
  const description = `Confira ofertas exclusivas de ${brand || 'veículos'} ${category || ''} em ${city || 'sua região'}. Preço justo, garantia e procedência no Carro no Preço.`;

  return (
    <>
      <SEO title={title} description={description} />
      <div className="pt-8">
        <div className="container mx-auto px-4 mb-8">
           <h1 className="text-4xl font-bold tracking-tight capitalize">{title}</h1>
           <p className="text-white/40 mt-2">Encontramos os melhores exemplares baseados na sua localização e preferências.</p>
        </div>
        <Search />
      </div>
    </>
  );
}
