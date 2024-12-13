import React, { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export interface ImageViewerProps {
  previewUrl: string;
  publishImageUrl: string;
  alt: string;
  aspectRatio?: number;
  onClick?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  previewUrl, 
  publishImageUrl, 
  alt, 
  aspectRatio = 3 / 2,
  onClick 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="relative cursor-pointer overflow-hidden rounded-lg group"
      style={{ 
        paddingBottom: `${(1 / aspectRatio) * 100}%`, 
        height: 0 
      }}
      onClick={onClick}
    >
      <div className="absolute inset-0">
        {/* Preview Image */}
        <Image
          src={previewUrl} 
          alt={`${alt} - Preview`}
          fill
          className={`
            absolute inset-0 object-cover
            transition-all duration-500 ease-in-out
            ${!isLoaded ? 'blur-sm opacity-80' : 'opacity-0'}
          `}
          onLoadingComplete={() => setIsLoaded(true)}
        />

        {/* Full Image */}
        <Image
          src={publishImageUrl}
          alt={alt}
          fill
          className="absolute inset-0 object-cover"
          onLoadingComplete={() => setIsLoaded(true)}
        />

        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 
              className="animate-spin text-white" 
              size={48} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;