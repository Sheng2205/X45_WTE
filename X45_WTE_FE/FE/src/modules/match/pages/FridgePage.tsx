import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, X, Sparkles, AlertCircle } from 'lucide-react';
import { matchApi } from '../api/match.api';
import type { Ingredient } from '../api/match.api';

const POPULAR_SUGGESTIONS = [
  'Trứng gà',
  'Thịt ba chỉ',
  'Cà chua',
  'Đậu phụ',
  'Hành lá',
  'Tôm tươi',
  'Thịt bò',
  'Khoai tây',
  'Nấm hương',
  'Cà rốt',
];

const MEAL_TYPES = [
  { id: 'all', label: 'Tất cả bữa' },
  { id: 'an_sang', label: 'Bữa sáng' },
  { id: 'an_trua', label: 'Bữa trưa' },
  { id: 'an_toi', label: 'Bữa tối' },
  { id: 'an_vat', label: 'Ăn vặt' },
  { id: 'do_uong', label: 'Đồ uống' },
  { id: 'mon_nhau', label: 'Món nhậu' },
];

const DIET_TAGS = [
  { id: 'chay', label: 'Ăn chay' },
  { id: 'man', label: 'Món mặn' },
  { id: 'keto', label: 'Keto' },
  { id: 'eat_clean', label: 'Eat Clean' },
  { id: 'low_carb', label: 'Low Carb' },
];

const ALLERGENS = [
  { id: 'dau_phong', label: 'Đậu phộng' },
  { id: 'hai_san', label: 'Hải sản' },
  { id: 'trung', label: 'Trứng' },
  { id: 'sua', label: 'Sữa' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'dau_nanh', label: 'Đậu nành' },
];

export const FridgePage: React.FC = () => {
  const location = useLocation();
  const presetNames = location.state?.presetIngredientNames as string[] | undefined;

  const [ingredients, setIngredients] = useState<string[]>(() => {
    if (presetNames && presetNames.length > 0) return presetNames;
    return ['Trứng gà', 'Cà chua', 'Hành lá'];
  });
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (presetNames && presetNames.length > 0) {
      setIngredients(presetNames);
    }
  }, [presetNames]);

  // Autocomplete fetch as user types
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await matchApi.searchIngredients(inputValue);
        setSuggestions(res.data || []);
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleAddIngredient = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const handleRemoveIngredient = (name: string) => {
    setIngredients(ingredients.filter((item) => item !== name));
  };

  const handleToggle = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (ingredients.length === 0) {
      setError('Vui lòng nhập ít nhất 1 nguyên liệu có trong tủ lạnh.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ingredients,
        mealType: selectedMealType === 'all' ? undefined : selectedMealType,
        dietTags: selectedDiets.length > 0 ? selectedDiets : undefined,
        allergens: selectedAllergens.length > 0 ? selectedAllergens : undefined,
      };
      const res = await matchApi.getMatchDishes(payload);
      navigate('/ket-qua', {
        state: { results: res.results, filterPayload: payload },
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: { message?: string } } } })?.response?.data?.message ||
        (err as { response?: { data?: { message?: string; error?: { message?: string } } } })?.response?.data?.error?.message ||
        'Có lỗi khi tìm món ăn.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Hero Title */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-text dark:text-foreground tracking-tight">
          Tủ Lạnh Hôm Nay Có Gì?
        </h1>
        <p className="text-surface-muted dark:text-neutral-400 mt-2 text-sm sm:text-base leading-relaxed max-w-3xl">
          Nhập những gì bạn đang có, WhatToEat sẽ tính tỷ lệ phù hợp (Match Score) để bạn không lãng phí đồ ăn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input & Filters */}
        <div className="lg:col-span-7 bg-white dark:bg-card p-6 sm:p-7 rounded-2xl border border-surface-border shadow-card">
          <h2 className="text-lg font-bold text-surface-text dark:text-foreground mb-4">
            Nguyên Liệu Trong Tủ
          </h2>

          {/* Autocomplete Input */}
          <div className="relative mb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-muted"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Nhập tên nguyên liệu (thịt bò, đậu hũ, cà chua...)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient(inputValue);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-transparent dark:text-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddIngredient(inputValue)}
                className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition text-sm flex items-center gap-1.5 shrink-0"
              >
                <Plus size={16} /> Thêm
              </button>
            </div>

            {/* Suggestions popup */}
            {suggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white dark:bg-neutral-800 border border-surface-border rounded-xl shadow-lg max-h-48 overflow-y-auto p-1.5 divide-y divide-surface-border">
                {suggestions.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleAddIngredient(item.name)}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm font-medium hover:bg-surface-dim dark:hover:bg-neutral-700/60 rounded-lg flex items-center justify-between text-surface-text dark:text-foreground"
                  >
                    <span>{item.name}</span>
                    <span className="text-primary font-bold text-xs">+ Chọn</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-surface-muted dark:text-neutral-400 uppercase tracking-wider block mb-2">
              Gợi ý thêm nhanh:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SUGGESTIONS.map((item) => {
                const isSelected = ingredients.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddIngredient(item)}
                    disabled={isSelected}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                      isSelected
                        ? 'border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 text-gray-400 dark:text-neutral-500 cursor-not-allowed'
                        : 'border-surface-border text-surface-text dark:text-foreground hover:border-primary hover:text-primary bg-white dark:bg-card'
                    }`}
                  >
                    + {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current selected pills */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-surface-muted dark:text-neutral-400 uppercase tracking-wider">
                Đã chọn ({ingredients.length}):
              </span>
              {ingredients.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIngredients([])}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 bg-surface-dim dark:bg-neutral-800/40 rounded-xl border border-surface-border">
              {ingredients.length === 0 ? (
                <span className="text-xs text-surface-muted italic self-center">
                  Chưa chọn nguyên liệu nào.
                </span>
              ) : (
                ingredients.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 bg-white dark:bg-card px-3 py-1.5 rounded-lg border border-surface-border text-xs font-semibold text-surface-text dark:text-foreground shadow-2xs"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(item)}
                      className="text-surface-muted hover:text-red-500 transition"
                      title="Bỏ nguyên liệu"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Filters Divider */}
          <hr className="border-surface-border mb-6" />

          {/* Filter 1: Bữa ăn */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-surface-muted dark:text-neutral-400 uppercase tracking-wider block mb-2">
              Thời Điểm Bữa Ăn
            </label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedMealType(type.id)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium transition ${
                    selectedMealType === type.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-dim dark:bg-neutral-800 text-surface-text dark:text-foreground hover:bg-gray-100 dark:hover:bg-neutral-700/60'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 2: Chế độ ăn */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-surface-muted dark:text-neutral-400 uppercase tracking-wider block mb-2">
              Chế Độ Ăn Ưu Tiên
            </label>
            <div className="flex flex-wrap gap-2">
              {DIET_TAGS.map((diet) => {
                const active = selectedDiets.includes(diet.id);
                return (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() =>
                      handleToggle(selectedDiets, setSelectedDiets, diet.id)
                    }
                    className={`text-xs px-3.5 py-2 rounded-xl font-medium border transition ${
                      active
                        ? 'border-primary bg-primary-light text-primary dark:bg-orange-950/60 dark:text-orange-300 font-semibold'
                        : 'border-surface-border text-surface-text dark:text-foreground hover:bg-gray-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {diet.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter 3: Dị ứng (BR-1 Loại cứng) */}
          <div className="mb-6 p-4 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
            <label className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-1">
              Tránh Dị Ứng (Loại Trừ Bắt Buộc)
            </label>
            <p className="text-[11px] text-surface-muted dark:text-neutral-400 mb-2.5">
              Hệ thống sẽ lọc bỏ hoàn toàn các món chứa thành phần bạn chọn.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((alg) => {
                const active = selectedAllergens.includes(alg.id);
                return (
                  <button
                    key={alg.id}
                    type="button"
                    onClick={() =>
                      handleToggle(selectedAllergens, setSelectedAllergens, alg.id)
                    }
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      active
                        ? 'border-red-400 bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-200 font-semibold'
                        : 'border-surface-border bg-white dark:bg-neutral-800 text-surface-text dark:text-foreground hover:bg-gray-50 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {alg.label} {active && '✕'}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-float hover:bg-primary-hover transition flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span>Đang tính điểm Match Score...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>
                  Tìm Món Ngon Ngay ({ingredients.length} nguyên liệu)
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Visual Preview Banner */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-card p-6 rounded-2xl border border-surface-border shadow-card overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80"
              alt="Món ăn gia đình"
              className="w-full h-48 sm:h-56 object-cover rounded-xl mb-4"
            />
            <h3 className="font-bold text-lg text-surface-text dark:text-foreground">
              Nấu Ngon Chuẩn Vị Gia Đình
            </h3>
            <p className="text-sm text-surface-muted dark:text-neutral-400 mt-1 leading-relaxed">
              Không cần băn khoăn "hôm nay ăn gì". Chọn nguyên liệu sẵn trong tủ lạnh và hệ thống sẽ gợi ý công thức tối ưu nhất theo điểm khớp (Match Score).
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-surface-border">
              <div className="p-3 bg-surface-dim dark:bg-neutral-800/60 rounded-xl">
                <span className="text-xs font-bold text-primary block uppercase">
                  100% An Toàn
                </span>
                <span className="text-xs text-surface-muted dark:text-neutral-400">
                  Lọc sạch chất gây dị ứng cho cả nhà
                </span>
              </div>
              <div className="p-3 bg-surface-dim dark:bg-neutral-800/60 rounded-xl">
                <span className="text-xs font-bold text-green-600 block uppercase">
                  Tiết Kiệm
                </span>
                <span className="text-xs text-surface-muted dark:text-neutral-400">
                  Tận dụng tối đa nguyên liệu có sẵn
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
