"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import CategoryFilter from '@/components/ui/category-filter';
import { useLanguage } from '@/contexts/LanguageContext';

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
  lastObservationId: string;
  type: string;
};

interface DeepSkyGalleryProps {
  initialObjects: GalleryObject[];
  initialCategories: string[];
}

export const DeepSkyGallery: React.FC<DeepSkyGalleryProps> = ({
  initialObjects,
  initialCategories
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { messages, language, t, plural } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const formatDate = (dateString: string) => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-GB';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredObjects = useMemo(() => {
    const filtered = initialObjects.filter(obj => {
      const searchMatch = (
        obj.designation.primary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.designation.alternates.some(alt => 
          alt.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
  
      const categoryMatch = selectedCategories.length === 0 ||
        selectedCategories.some(cat => obj.categories.includes(cat));
  
      return searchMatch && categoryMatch;
    });
  
    return filtered.sort((a, b) => 
      new Date(b.lastObservation).getTime() - new Date(a.lastObservation).getTime()
    );
  }, [initialObjects, searchTerm, selectedCategories]);

  if (!mounted || !messages.gallery) {
    return null;
  }

  return (
    <div className="space-y-6">
      <CategoryFilter
        categories={initialCategories}
        selectedCategories={selectedCategories}
        onCategoryToggle={toggleCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={messages.gallery.searchPlaceholder}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredObjects.map(obj => (
          <Link
            key={obj.designation.primary}
            href={`/objects/${obj.designation.primary.toLowerCase()}/${obj.lastObservationId}`}
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
                  <span className="text-gray-400">{messages.gallery.noImageAvailable}</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  <span className="font-mono text-blue-400">{obj.designation.primary}</span>
                  {" - "}
                  {t(`objectNames.${obj.name}`, obj.name)}
                </h3>
                <p className="text-sm text-gray-400 mb-2">{t(`objectTypes.${obj.type}`, obj.type)}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {obj.categories.map(category => (
                    <Badge key={category} variant="outline" className="text-xs">
                      {t(`categories.${category}`, category)}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <p>
                    {obj.observationCount} {plural(obj.observationCount, messages.gallery.observations)}
                  </p>
                  {obj.lastObservation && (
                    <p>{messages.gallery.lastCaptured}: {formatDate(obj.lastObservation)}</p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {filteredObjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">{messages.gallery.noObjectsFound}</p>
        </div>
      )}
    </div>
  );
};
