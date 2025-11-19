"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ImageViewer from '@/components/ui/image-viewer';
import Notes from '@/components/ObjectViewer/Notes';
import { useLanguage } from '@/contexts/LanguageContext';
import { Translation } from '@/lib/types';

interface EquipmentInfo {
  telescope?: string;
  camera?: string;
  mount?: string;
  filters?: string[];
  guiding?: string;
}

interface ObjectObservation {
  id: string;
  objectName: string;
  previewImageUrl: string;
  publishImageUrl: string;
  dateCaptured: string;
  location: string;
  equipment: EquipmentInfo;
  exposure?: string;
  translatedNotes: Record<string, Translation>;
}

interface ObjectViewerProps {
  designation: string;
  name: string;
  type: string;
  categories: string[];
  observations: ObjectObservation[];
  descriptionTranslations: Record<string, Translation>;
  initialObservationIndex?: number;
}

export const ObjectViewer: React.FC<ObjectViewerProps> = ({
  designation,
  name,
  type,
  categories,
  observations,
  descriptionTranslations,
  initialObservationIndex = 0
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialObservationIndex);
  const [imageKey, setImageKey] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { messages, t, decline, translate, formatDate } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const currentObservationId = observations[currentImageIndex].id;
    const currentPath = pathname?.split('/');
    const lastSegment = currentPath?.[currentPath.length - 1];

    if (lastSegment !== currentObservationId) {
      const basePath = currentPath?.slice(0, -1).join('/') || '';
      router.replace(`${basePath}/${currentObservationId}`, { scroll: false });
    }
  }, [currentImageIndex, observations, pathname, router]);

  const currentImage = observations[currentImageIndex];
  
  const nextImage = () => {
    setCurrentImageIndex((current) => {
      const newIndex = current === observations.length - 1 ? current : current + 1;
      setImageKey(prev => prev + 1);
      return newIndex;
    });
  };

  const previousImage = () => {
    setCurrentImageIndex((current) => {
      const newIndex = current === 0 ? current : current - 1;
      setImageKey(prev => prev + 1);
      return newIndex;
    });
  };

  useEffect(() => {
    setImageKey(prev => prev + 1);
  }, [observations]);

  if (!mounted || !messages.objectViewer) {
    return null;
  }

  // Use translate helper to get the description in current language
  const displayDescription = translate(
    Object.fromEntries(
      Object.entries(descriptionTranslations).map(([lang, trans]) => [lang, trans.description || ''])
    ),
    ''
  );

  const translatedName = t(`objectNames.${name}`, name);
  const translatedNamePrepositional = decline(`objectNames.${name}`, 'prepositional', name);
  
  // Use translate helper to get the notes in current language
  const displayNotes = translate(
    Object.fromEntries(
      Object.entries(currentImage.translatedNotes).map(([lang, trans]) => [lang, trans.notes || ''])
    ),
    ''
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="font-mono text-blue-400">{designation}</span>
          {" - "}
          {translatedName}
        </h1>
        <p className="text-gray-400 mb-2">{t(`objectTypes.${type}`, type)}</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge key={category} variant="outline">
              {t(`categories.${category}`, category)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <div className="relative">
          <ImageViewer 
            key={imageKey}
            fullImageUrl={currentImage.publishImageUrl}
            alt={`${translatedName} - Image ${currentImageIndex + 1}`}
            objectName={currentImage.objectName}
            observationDate={currentImage.dateCaptured}
            onClick={() => {}}
            containerAspectRatio={3/2}
          />
          
          {observations.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
              <button
                onClick={previousImage}
                disabled={currentImageIndex === 0}
                className="p-2 rounded-full bg-black/50 text-white disabled:opacity-50 pointer-events-auto"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                disabled={currentImageIndex === observations.length - 1}
                className="p-2 rounded-full bg-black/50 text-white disabled:opacity-50 pointer-events-auto"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{messages.objectViewer.observationDetails}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400">{messages.objectViewer.dateCaptured}</div>
            <div>{formatDate(currentImage.dateCaptured)}</div>
          </div>
          <div>
            <div className="text-gray-400">{messages.objectViewer.location}</div>
            <div>{currentImage.location}</div>
          </div>
          {currentImage.exposure && (
            <div>
              <div className="text-gray-400">{messages.objectViewer.exposure}</div>
              <div>{currentImage.exposure}</div>
            </div>
          )}
        </div>
      </div>

      {currentImage.equipment && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{messages.objectViewer.equipment}</h2>
          <div className="grid grid-cols-2 gap-4">
            {currentImage.equipment.telescope && (
              <div>
                <div className="text-gray-400">{messages.objectViewer.telescope}</div>
                <div>{currentImage.equipment.telescope}</div>
              </div>
            )}
            {currentImage.equipment.camera && (
              <div>
                <div className="text-gray-400">{messages.objectViewer.camera}</div>
                <div>{currentImage.equipment.camera}</div>
              </div>
            )}
            {currentImage.equipment.mount && (
              <div>
                <div className="text-gray-400">{messages.objectViewer.mount}</div>
                <div>{currentImage.equipment.mount}</div>
              </div>
            )}
            {currentImage.equipment.filters && (
              <div>
                <div className="text-gray-400">{messages.objectViewer.filters}</div>
                <ul className="list-disc pl-4">
                  {currentImage.equipment.filters.map((filter, index) => (
                    <li key={index}>{filter}</li>
                  ))}
                </ul>
              </div>
            )}
            {currentImage.equipment.guiding && (
              <div>
                <div className="text-gray-400">{messages.objectViewer.guiding}</div>
                <div>{currentImage.equipment.guiding}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {displayNotes && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{messages.objectViewer.notes}</h2>
          <Notes content={displayNotes} />
        </div>
      )}

      {displayDescription && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{messages.objectViewer.about} {translatedNamePrepositional}</h2>
          <div className="prose prose-invert max-w-none">
            {displayDescription.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
