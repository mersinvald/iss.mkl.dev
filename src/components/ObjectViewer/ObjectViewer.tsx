"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ImageViewer from '@/components/ui/image-viewer';

interface EquipmentInfo {
  telescope?: string;
  camera?: string;
  mount?: string;
  filters?: string[];
  guiding?: string;
}

interface ObjectObservation {
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
}

export const ObjectViewer: React.FC<ObjectViewerProps> = ({
  designation,
  name,
  categories,
  observations,
  description
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const currentImage = observations[currentImageIndex];
  
  const nextImage = () => {
    setCurrentImageIndex((current) => 
      current === observations.length - 1 ? current : current + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((current) => 
      current === 0 ? current : current - 1
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Image Viewer */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <ImageViewer 
          previewUrl={currentImage.previewImageUrl} 
          fullImageUrl={currentImage.publishImageUrl}
          alt={`${name} - Image ${currentImageIndex + 1}`}
          onClick={() => {}}
        />
        
        {observations.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={previousImage}
              disabled={currentImageIndex === 0}
              className="p-2 rounded-full bg-black/50 text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              disabled={currentImageIndex === observations.length - 1}
              className="p-2 rounded-full bg-black/50 text-white disabled:opacity-50"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
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
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          {currentImage.notes.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
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