"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input'
import Image from 'next/image';

type GalleryObject = {
  designation: {
    primary: string;
    alternates: string[];
  };
  name: string;
  categories: string[];
  previewImage: string | null;
  observationCount: number;
  lastObservation: string;
  type: string;
};

interface DeepSkyGalleryProps {
  initialObjects: GalleryObject[];
  initialCategories: string[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const DeepSkyGallery: React.FC<DeepSkyGalleryProps> = ({
  initialObjects,
  initialCategories
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredObjects = useMemo(() => {
    return initialObjects.filter(obj => {
      // Search in designation (primary and alternates) and name
      const searchMatch = (
        obj.designation.primary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.designation.alternates.some(alt => 
          alt.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

      // Filter by selected categories
      const categoryMatch = selectedCategories.length === 0 ||
        selectedCategories.some(cat => obj.categories.includes(cat));

      return searchMatch && categoryMatch;
    });
  }, [initialObjects, searchTerm, selectedCategories]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search objects..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {initialCategories.map(category => (
            <Badge
              key={category}
              variant={selectedCategories.includes(category) ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredObjects.map(obj => (
          <Link
            key={obj.designation.primary}
            href={`/${obj.designation.primary.toLowerCase()}`}
          >
            <Card className="h-full hover:ring-2 hover:ring-blue-500 transition-all">
              {obj.previewImage ? (
                <div className="aspect-video overflow-hidden rounded-t-lg relative">
                  <Image
                    src={obj.previewImage}
                    alt={obj.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-800 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <span className="font-mono text-blue-400">{obj.designation.primary}</span>
                  {" - "}
                  {obj.name}
                </h3>
                <p className="text-sm text-gray-400 mb-2">{obj.type}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {obj.categories.map(category => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <p>{obj.observationCount} observation{obj.observationCount !== 1 ? 's' : ''}</p>
                  {obj.lastObservation && (
                    <p>Last captured: {formatDate(obj.lastObservation)}</p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredObjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No objects found matching your criteria</p>
        </div>
      )}
    </div>
  );
};