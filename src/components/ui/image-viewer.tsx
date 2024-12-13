import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export interface ImageViewerProps {
  previewUrl: string;
  publishImageUrl: string;
  alt: string;
  aspectRatio?: number; // Allow custom aspect ratio
  onClick?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ 
  previewUrl, 
  publishImageUrl, 
  alt, 
  aspectRatio = 16 / 9, // Default 16:9 aspect ratio
  onClick 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const image = new Image();
    image.src = publishImageUrl;
    
    image.onload = () => {
      setIsLoading(false);
    };

    image.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [publishImageUrl]);

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
        {/* Blurred Preview */}
        <img 
          src={previewUrl} 
          alt={`${alt} - Preview`}
          className={`
            absolute inset-0 w-full h-full object-cover
            transition-all duration-500 ease-in-out
            ${isLoading ? 'blur-sm opacity-80' : 'opacity-0'}
          `}
        />

        {/* Full Image */}
        {!isLoading && (
          <img 
            src={publishImageUrl}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
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