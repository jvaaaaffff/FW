import React from "react";
import { X } from "lucide-react";
import { formatPrice } from "../utils/format";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  selectedMaterials: string[];
  setSelectedMaterials: (materials: string[]) => void;
  availableColors: string[];
  availableMaterials: string[];
  availableCategories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export function FilterSidebar({
  isOpen,
  onClose,
  priceRange,
  setPriceRange,
  selectedColors,
  setSelectedColors,
  selectedMaterials,
  setSelectedMaterials,
  availableColors,
  availableMaterials,
  availableCategories,
  selectedCategory,
  setSelectedCategory,
}: FilterSidebarProps) {
  const handleColorToggle = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleMaterialToggle = (material: string) => {
    if (selectedMaterials.includes(material)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== material));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:z-40 w-80 bg-brand-bg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-[160px] lg:h-[calc(100vh-160px)] lg:w-64 lg:block lg:flex-shrink-0 border-r border-brand-border overflow-y-auto hide-scrollbar ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8 lg:hidden">
            <h2 className="text-xl font-serif font-bold text-brand-text">
              Filters
            </h2>
            <button
              onClick={onClose}
              className="text-brand-muted hover:text-brand-text"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-lg font-serif font-bold text-brand-text uppercase tracking-widest border-b border-brand-border pb-4">
              Filters
            </h2>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-4">
              Category
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 hide-scrollbar">
              {availableCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center w-5 h-5 mr-3 border border-brand-border rounded-sm group-hover:border-brand-accent transition-colors">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedCategory === category}
                      onChange={() =>
                        setSelectedCategory(
                          selectedCategory === category ? null : category,
                        )
                      }
                    />
                    {selectedCategory === category && (
                      <div className="w-3 h-3 bg-brand-accent rounded-sm" />
                    )}
                  </div>
                  <span className="text-sm text-brand-muted group-hover:text-brand-text transition-colors">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-4">
              Price Range
            </h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-brand-muted">{formatPrice(priceRange[0])}</span>
              <span className="text-sm text-brand-muted">{formatPrice(priceRange[1])}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], parseInt(e.target.value)])
              }
              className="w-full accent-brand-accent"
            />
          </div>

          {/* Color Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-4">
              Color
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 hide-scrollbar">
              {availableColors.map((color) => (
                <label
                  key={color}
                  className="flex items-center cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center w-5 h-5 mr-3 border border-brand-border rounded-sm group-hover:border-brand-accent transition-colors">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedColors.includes(color)}
                      onChange={() => handleColorToggle(color)}
                    />
                    {selectedColors.includes(color) && (
                      <div className="w-3 h-3 bg-brand-accent rounded-sm" />
                    )}
                  </div>
                  <span className="text-sm text-brand-muted group-hover:text-brand-text transition-colors">
                    {color}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Material Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-4">
              Fabric
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 hide-scrollbar">
              {availableMaterials.map((material) => (
                <label
                  key={material}
                  className="flex items-center cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center w-5 h-5 mr-3 border border-brand-border rounded-sm group-hover:border-brand-accent transition-colors">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedMaterials.includes(material)}
                      onChange={() => handleMaterialToggle(material)}
                    />
                    {selectedMaterials.includes(material) && (
                      <div className="w-3 h-3 bg-brand-accent rounded-sm" />
                    )}
                  </div>
                  <span className="text-sm text-brand-muted group-hover:text-brand-text transition-colors">
                    {material}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border">
            <button
              onClick={() => {
                setPriceRange([0, 1000]);
                setSelectedColors([]);
                setSelectedMaterials([]);
                setSelectedCategory(null);
              }}
              className="w-full py-3 text-xs font-bold uppercase tracking-widest text-brand-text border border-brand-text hover:bg-brand-text hover:text-brand-bg transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
