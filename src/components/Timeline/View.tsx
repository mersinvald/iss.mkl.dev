"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, Camera } from 'lucide-react';
import CategoryFilter from '@/components/ui/category-filter';
import Image from 'next/image';

interface TimelineObservation {
  id: string;
  date: string;
  objectDesignation: string;
  objectName: string;
  categories: string[];
  location: {
    name: string;
  };
  equipment: {
    telescope: string;
    camera: string;
  };
  previewImageUrl: string;
  notes?: string;
}

interface TimelineViewProps {
  observations: TimelineObservation[];
  categories: string[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ observations, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredObservations = useMemo(() => {
    return observations.filter(obs => {
      // Search in designation and name
      const searchMatch = (
        obs.objectDesignation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.objectName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Filter by selected categories
      const categoryMatch = selectedCategories.length === 0 ||
        selectedCategories.some(cat => obs.categories.includes(cat));

      return searchMatch && categoryMatch;
    });
  }, [observations, searchTerm, selectedCategories]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <CategoryFilter
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryToggle={toggleCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search observations..."
      />

      {filteredObservations.map((observation) => (
        <Card key={observation.id} className="bg-gray-800 border-gray-700">
          <div className="grid md:grid-cols-3 gap-6 p-6">
            {/* Image */}
            <div className="relative aspect-[3/2] w-full">
            <Link href={`/objects/${observation.objectDesignation.toLowerCase()}/${observation.id}`} className="block h-full">
              <Image
                src={observation.previewImageUrl}
                alt={`${observation.objectName} observation from ${formatDate(observation.date)}`}
                fill
                className="object-cover object-center rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </Link>
          </div>

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <Link 
                  href={`/objects/${observation.objectDesignation.toLowerCase()}/${observation.id}`}
                  className="text-xl font-bold text-blue-400 hover:text-blue-300"
                >
                  <span className="font-mono">{observation.objectDesignation}</span>
                  {" - "}
                  {observation.objectName}
                </Link>
                <div className="flex flex-wrap gap-2 mt-2">
                  {observation.categories.map(category => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(observation.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{observation.location.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>{observation.equipment.telescope} + {observation.equipment.camera}</span>
                </div>
              </div>

              {observation.notes && (
                <p className="text-gray-400 mt-2 line-clamp-3">
                  {observation.notes.split('\n')[0]}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}

      {filteredObservations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No observations found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default TimelineView;