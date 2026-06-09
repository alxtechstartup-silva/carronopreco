import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export default function SEO({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | Carro no Preço - Inteligência Automotiva`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    // Schema.org for Enterprise SEO
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": description,
      "publisher": {
        "@type": "Organization",
        "name": "Carro no Preço"
      }
    };

    let script = document.getElementById('json-ld-seo');
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-seo';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.innerHTML = JSON.stringify(schema);

  }, [title, description]);

  return null;
}
