import { CATEGORIES } from '../types/lexicon';

interface CategoryFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts: Record<string, number>;
}

export function CategoryFilterBar({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryFilterBarProps) {
  const allOptions = ['All', ...CATEGORIES];

  return (
    <div
      role="tablist"
      aria-label="Filter terminology by category"
      className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1"
    >
      {allOptions.map((category) => {
        const isActive = selectedCategory === category;
        const count = categoryCounts[category] ?? 0;

        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(category)}
            className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA] tabular-nums ${
              isActive
                ? 'border-[#3B82F6] bg-[#3B82F6] text-white'
                : 'border-[#1F3254] bg-[#101C34] text-[#94A3B8] hover:border-[#2E4675] hover:bg-[#152442] hover:text-[#F1F5F9]'
            }`}
          >
            <span>{category}</span>
            <span
              className={`ml-1.5 font-mono text-[11px] ${
                isActive ? 'text-white/85' : 'text-[#64748B]'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
