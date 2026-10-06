import { useState, useEffect } from 'react';
import { Input } from '@/shared/components/ui/input';
import { matchApi } from '../api/match.api';
import type { Ingredient } from '../api/match.api';

interface IngredientInputProps {
  value: string[];
  onChange: (ids: string[]) => void;
  presetNames?: string[];
}

export function IngredientInput({ value, onChange, presetNames }: IngredientInputProps) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, string>>({});

  useEffect(() => {
    matchApi.getAllIngredients()
      .then((res) => {
        setAllIngredients(res.data);
        const map: Record<string, string> = {};
        res.data.forEach((item) => {
          map[item._id] = item.name;
        });
        setSelectedMap((prev) => ({ ...prev, ...map }));

        if (presetNames && presetNames.length > 0) {
          const matchedIds: string[] = [];
          presetNames.forEach((pName) => {
            const found = res.data.find(
              (i) => i.name.toLowerCase() === pName.toLowerCase()
            );
            if (found && !value.includes(found._id)) {
              matchedIds.push(found._id);
            }
          });
          if (matchedIds.length > 0) {
            onChange([...value, ...matchedIds]);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim()) {
        try {
          const res = await matchApi.searchIngredients(search);
          setSuggestions(res.data);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (ingredient: Ingredient) => {
    if (!value.includes(ingredient._id)) {
      onChange([...value, ingredient._id]);
      setSelectedMap((prev) => ({ ...prev, [ingredient._id]: ingredient.name }));
    }
    setSearch('');
    setSuggestions([]);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  const quickPicks = allIngredients
    .filter((ing) => !value.includes(ing._id))
    .slice(0, 8);

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-wider text-foreground/80">
          Nguyên liệu sẵn có ({value.length})
        </label>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted-foreground hover:text-destructive font-medium transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Selected Chips Box */}
      <div className="min-h-[50px] rounded-2xl border border-border/80 bg-background p-3 flex flex-wrap gap-2 transition-all">
        {value.length === 0 ? (
          <span className="text-sm text-muted-foreground/70 italic self-center px-1">
            Chưa chọn nguyên liệu. Gõ tìm hoặc chạm danh mục bên dưới...
          </span>
        ) : (
          value.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/40 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-orange-900 dark:text-orange-200 shadow-2xs"
            >
              <span>{selectedMap[id] || 'Đang tải...'}</span>
              <button
                type="button"
                onClick={() => handleRemove(id)}
                className="ml-1.5 rounded-full text-orange-700 dark:text-orange-300 hover:text-destructive transition-colors font-bold text-sm"
                title="Bỏ nguyên liệu này"
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nhập tên nguyên liệu (thịt heo, trứng, cà chua...)"
          className="h-11 sm:h-12 rounded-xl border-border/80 bg-background text-sm px-4 focus-visible:ring-primary shadow-2xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}

        {/* Suggestion Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-20 w-full bg-card border border-border rounded-2xl shadow-xl mt-1.5 max-h-56 overflow-y-auto p-1.5 divide-y divide-border/40">
            {suggestions.map((item) => {
              const isSelected = value.includes(item._id);
              return (
                <button
                  key={item._id}
                  type="button"
                  disabled={isSelected}
                  className={`w-full text-left p-3 rounded-xl text-sm flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'opacity-40 cursor-not-allowed bg-muted/40'
                      : 'hover:bg-primary/10 hover:text-primary cursor-pointer'
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="font-semibold">{item.name}</span>
                  {isSelected ? (
                    <span className="text-xs text-muted-foreground">Đã thêm</span>
                  ) : (
                    <span className="text-primary text-xs sm:text-sm font-bold">+ Chọn</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Picks */}
      {quickPicks.length > 0 && (
        <div className="pt-1.5">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">
            Gợi ý thêm nhanh:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPicks.map((ing) => (
              <button
                key={ing._id}
                type="button"
                onClick={() => handleSelect(ing)}
                className="rounded-full border border-border/80 bg-muted/30 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-foreground/80 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all"
              >
                + {ing.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
