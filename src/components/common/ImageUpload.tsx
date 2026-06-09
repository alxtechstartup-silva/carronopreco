import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, UploadCloud, X, Loader2, Sparkles } from 'lucide-react';

interface ImageUploadProps {
  onImagesReady: (urls: string[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ onImagesReady, maxFiles = 4 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Downscale for compression and storage efficiency (Pillar 2: compression, webp)
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          
          // Draw original image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Draw exquisite translucent Watermark (Pillar 2: Watermark)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(0, height - 36, width, 36);
          
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#0f0f12';
          ctx.textAlign = 'right';
          ctx.fillText('CARRO NO PREÇO • VERIFICADO', width - 20, height - 12);
          
          // Convert to highly compressed modern WEBP format (Pillar 2: WEBP format)
          const webpDataUrl = canvas.toDataURL('image/webp', 0.5);
          resolve(webpDataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setProcessing(true);
    const newImages: string[] = [];
    
    try {
      const filesToProcess = files.slice(0, maxFiles - images.length);
      for (const file of filesToProcess) {
        const compressedUrl = await processFile(file as File);
        newImages.push(compressedUrl);
      }
      
      const updated = [...images, ...newImages];
      setImages(updated);
      onImagesReady(updated);
    } catch (err) {
      console.error('Error compression upload:', err);
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesReady(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Imagens Reais do Veículo</label>
        <span className="text-[10px] text-accent/80 font-mono">Max: {maxFiles} fotos • Compactado em WebP</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Gallery thumbnails */}
        {images.map((img, idx) => (
          <div key={idx} className="relative h-28 bg-white/5 rounded-2xl overflow-hidden group border border-white/10">
            <img src={img} className="w-full h-full object-cover" alt="Uploaded Thumbnail" />
            <button 
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 text-white shadow"
            >
              <X size={12} />
            </button>
            <div className="absolute bottom-1 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase tracking-wider">Foto {idx + 1}</div>
          </div>
        ))}

        {images.length < maxFiles && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-28 bg-white/5 hover:bg-white/10 rounded-2xl border border-dashed border-white/20 hover:border-accent flex flex-col items-center justify-center p-4 cursor-pointer text-center transition-all group gap-1"
          >
            {processing ? (
              <>
                <Loader2 className="animate-spin text-accent" size={24} />
                <span className="text-[10px] text-white/40">Compactando...</span>
              </>
            ) : (
              <>
                <UploadCloud className="text-white/40 group-hover:text-accent transition-colors" size={24} />
                <span className="text-[10px] font-bold text-white/60">Upload Foto</span>
                <span className="text-[8px] text-white/30 font-mono">Arraste ou clique</span>
              </>
            )}
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        multiple 
        className="hidden" 
      />
    </div>
  );
}
