import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  searchTerm,
  onSearchChange,
  searchPlaceholder
}) => {
  const { messages, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const placeholder = searchPlaceholder || messages.gallery?.searchPlaceholder || messages.timeline?.searchPlaceholder || "Search...";
  const allCategoriesLabel = messages.gallery?.allCategories || messages.timeline?.allCategories || "All Categories";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder={placeholder}
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategories.length === 0 ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => {
            if (selectedCategories.length > 0) {
              selectedCategories.forEach(cat => onCategoryToggle(cat));
            }
          }}
        >
          {allCategoriesLabel}
        </Badge>
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => onCategoryToggle(category)}
          >
            {t(`categories.${category}`, category)}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
