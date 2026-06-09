import { Link } from 'react-router-dom';
import { ShieldAlert, Fingerprint, ShieldCheck } from 'lucide-react';

export const fraudService = {
  async analyzeListing(vehicleData: any) {
    const anomalies: string[] = [];

    const textToScan = `${vehicleData.brand} ${vehicleData.model} ${vehicleData.description}`.toLowerCase();
    
    // Prohibited and spam word detection list (Pillar 3: palavras proibidas, detecção spam)
    const bannedPhrases = [
      'facilidade de credito',
      'sem consulta',
      'urgente pix',
      'garantia de aprovacao',
      'oportunidade secreta',
      'dinheiro facil',
      'carta de credito contemplada',
      '100% financiado sem entrada',
      'esquema'
    ];

    const foundBanned = bannedPhrases.filter(phrase => textToScan.includes(phrase));
    if (foundBanned.length > 0) {
      anomalies.push(`Palavras suspeitas / proibidas detectadas: "${foundBanned.join(', ')}"`);
    }

    if (vehicleData.price && Number(String(vehicleData.price).replace(/\D/g, '')) < 1000) {
      anomalies.push("Preço inválido ou irreal.");
    }

    const isFraudulent = anomalies.length > 0;

    return {
      trustScore: isFraudulent ? 25 : 95,
      isFraudulent,
      anomalies
    };
  },

  async verifyIdentity() {
    return { status: 'verified', method: 'face-id-biometrics' };
  }
};
