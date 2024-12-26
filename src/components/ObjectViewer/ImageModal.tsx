import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  src: string;
  alt: string;
  caption?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, caption, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
      >
        <X className="h-8 w-8" />
      </button>
      
      <div className="max-h-screen max-w-screen-2xl p-4">
        <div className="relative h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] object-contain"
          />
          {caption && (
            <p className="text-white/80 text-center mt-2">{caption}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;