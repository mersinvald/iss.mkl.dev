"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ImageViewer from '@/components/ui/image-viewer';
import Notes from '@/components/ObjectViewer/Notes';

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
  notes?: string;
}

interface ObjectViewerProps {
  designation: string;
  name: string;
  categories: string[];
  observations: ObjectObservation[];
  description: string;
  initialObservationIndex?: number;
}

export const ObjectViewer: React.FC<ObjectViewerProps> = ({
  designation,
  name,
  categories,
  observations,
  description,
  initialObservationIndex = 0
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialObservationIndex);
  const [imageKey, setImageKey] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Effect for URL updates
  useEffect(() => {
    const currentObservationId = observations[currentImageIndex].id;
    const currentPath = pathname?.split('/');
    const lastSegment = currentPath?.[currentPath.length - 1];

    // Only update if the current URL doesn't match the current observation
    if (lastSegment !== currentObservationId) {
      const basePath = currentPath?.slice(0, -1).join('/') || '';
      router.replace(`${basePath}/${currentObservationId}`, { scroll: false });
    }
  }, [currentImageIndex, observations, pathname, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

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

  // Reset image key when observations change
  useEffect(() => {
    setImageKey(prev => prev + 1);
  }, [observations]);

  return (
    <div className="space-y-8">
      {/* Component JSX remains exactly the same */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="font-mono text-blue-400">{designation}</span>
          {" - "}
          {name}
        </h1>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge key={category} variant="outline">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <div className="relative">
          <ImageViewer 
            key={imageKey}
            fullImageUrl={currentImage.publishImageUrl}
            alt={`${name} - Image ${currentImageIndex + 1}`}
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

      {/* Observation Details */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Observation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400">Date Captured</div>
            <div>{formatDate(currentImage.dateCaptured)}</div>
          </div>
          <div>
            <div className="text-gray-400">Location</div>
            <div>{currentImage.location}</div>
          </div>
          {currentImage.exposure && (
            <div>
              <div className="text-gray-400">Exposure</div>
              <div>{currentImage.exposure}</div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment */}
      {currentImage.equipment && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Equipment</h2>
          <div className="grid grid-cols-2 gap-4">
            {currentImage.equipment.telescope && (
              <div>
                <div className="text-gray-400">Telescope</div>
                <div>{currentImage.equipment.telescope}</div>
              </div>
            )}
            {currentImage.equipment.camera && (
              <div>
                <div className="text-gray-400">Camera</div>
                <div>{currentImage.equipment.camera}</div>
              </div>
            )}
            {currentImage.equipment.mount && (
              <div>
                <div className="text-gray-400">Mount</div>
                <div>{currentImage.equipment.mount}</div>
              </div>
            )}
            {currentImage.equipment.filters && (
              <div>
                <div className="text-gray-400">Filters</div>
                <ul className="list-disc pl-4">
                  {currentImage.equipment.filters.map((filter, index) => (
                    <li key={index}>{filter}</li>
                  ))}
                </ul>
              </div>
            )}
            {currentImage.equipment.guiding && (
              <div>
                <div className="text-gray-400">Guiding</div>
                <div>{currentImage.equipment.guiding}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {currentImage.notes && (
        <div className="bg-gray-800 rounded-lg p-6">
        <Notes 
          content={currentImage.notes}
        />
        </div>
      )}

      {/* Description */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">About {name}</h2>
        <div className="prose prose-invert max-w-none">
          {description.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};