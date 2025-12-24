'use client';

import { Star, Grid3x3 } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  showFavoritesFilter?: boolean;
  favoritesActive?: boolean;
  onFavoritesToggle?: () => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategorySelect,
  showFavoritesFilter = true,
  favoritesActive = false,
  onFavoritesToggle,
}: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      {/* Favorites Filter */}
      {showFavoritesFilter && (
        <button
          onClick={onFavoritesToggle}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
            favoritesActive
              ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 text-yellow-300 shadow-lg shadow-yellow-500/20'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200 hover:border-white/20'
          }`}
        >
          <Star className={`h-5 w-5 ${favoritesActive ? 'fill-yellow-300' : ''}`} />
          <span>Favorites</span>
        </button>
      )}

      {/* All Channels */}
      <button
        onClick={() => onCategorySelect(null)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
          selectedCategory === null && !favoritesActive
            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-2 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/20'
            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200 hover:border-white/20'
        }`}
      >
        <Grid3x3 className="h-5 w-5" />
        <span>All Channels</span>
      </button>

      {/* Category List */}
      {categories.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold px-4 py-2">
            Categories
          </p>
          <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  selectedCategory === category && !favoritesActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <span className="truncate">{category}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
