import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  X,
  Sparkles,
  Shuffle,
  RotateCw,
  Clock,
  Heart,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { favoritesApi } from '@/modules/favorites/api/favorites.api';
import { matchApi, dishService } from '../api/match.api';
import { getDishImageUrl } from '@/shared/lib/dishImages';
import { toast } from 'sonner';
import type { Ingredient, ScoredDish } from '../api/match.api';

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

export function QuickPickPage() {
  const [ingredients, setIngredients] = useState<string[]>([
    'Trứng gà',
    'Cà chua',
    'Hành lá',
  ]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const [pickedDish, setPickedDish] = useState<ScoredDish | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rouletteRef = useRef<HTMLDivElement>(null);

  // Load favorites
  useEffect(() => {
    favoritesApi
      .getAll()
      .then((res) => {
        const ids = (res.data as any[]).map(
          (f) => f.dish?._id || f.dishId?._id || f.dishId
        );
        setFavoriteIds(ids.filter(Boolean));
      })
      .catch(() => {});
  }, []);

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

  const handlePick = async () => {
    const effectiveIngredients =
      ingredients.length > 0
        ? ingredients
        : ['Trứng gà', 'Cà chua', 'Thịt bò', 'Thịt ba chỉ', 'Hành lá'];

    setError(null);
    setLoading(true);
    setPickedDish(null);

    // Smoothly scroll to roulette on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        rouletteRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }

    try {
      const res = await dishService.getQuickPick({
        ingredients: effectiveIngredients,
        mealType: selectedMealType === 'all' ? undefined : selectedMealType,
        dietTags: selectedDiets.length > 0 ? selectedDiets : undefined,
        allergens: selectedAllergens.length > 0 ? selectedAllergens : undefined,
      });
      setPickedDish(res);
      toast.success('Đã quay được món ăn bất ngờ cho bạn!');
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        'Không tìm thấy món ăn nào phù hợp với các tiêu chí này.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (dishId: string) => {
    const isFav = favoriteIds.includes(dishId);
    try {
      if (isFav) {
        await favoritesApi.remove(dishId);
        setFavoriteIds((prev) => prev.filter((id) => id !== dishId));
        toast.success('Đã bỏ lưu món');
      } else {
        await favoritesApi.add(dishId);
        setFavoriteIds((prev) => [...prev, dishId]);
        toast.success('Đã lưu vào danh sách món yêu thích!');
      }
    } catch {
      toast.error('Không thể cập nhật yêu thích');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-primary dark:text-orange-300 bg-primary-light dark:bg-orange-950/60 px-3 py-1 rounded-full uppercase tracking-wider">
          Chọn Nhanh 1 Chạm
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-text dark:text-foreground mt-2 tracking-tight">
          Hôm Nay Ăn Gì? (Chọn Món Nhanh)
        </h1>
        <p className="text-sm text-surface-muted dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed">
          Đau đầu vì cả nhà mỗi người một ý? Bếp trưởng WhatToEat sẽ quay ngẫu nhiên có trọng số món ăn phù hợp nhất với nguyên liệu sẵn có trong tủ lạnh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input & Filters (Đồng bộ chuẩn 1:1 với FridgePage) */}
        <div className="lg:col-span-6 bg-white dark:bg-card p-6 sm:p-7 rounded-2xl border border-surface-border shadow-card">
          <h2 className="text-lg font-bold text-surface-text dark:text-foreground mb-4">
            Thiết Lập Nguyên Liệu Quay Món
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
                  placeholder="Nhập nguyên liệu (thịt bò, trứng, đậu phụ...)"
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
                className="px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition text-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus size={16} /> Thêm
              </button>
            </div>

            {/* Suggestions dropdown */}
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
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
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
                  className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 bg-surface-dim dark:bg-neutral-800/40 rounded-xl border border-surface-border">
              {ingredients.length === 0 ? (
                <span className="text-xs text-surface-muted italic self-center">
                  Chưa chọn nguyên liệu. Hệ thống sẽ tự dùng nguyên liệu phổ biến.
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
                      className="text-surface-muted hover:text-red-500 transition cursor-pointer"
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
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium transition cursor-pointer ${
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
                    className={`text-xs px-3.5 py-2 rounded-xl font-medium border transition cursor-pointer ${
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

          {/* Filter 3: Dị ứng (BR-1) */}
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
                    className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer ${
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

          {/* Submit Button */}
          <button
            type="button"
            onClick={handlePick}
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-float hover:bg-primary-hover transition flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RotateCw size={18} className="animate-spin" /> Đang quay món...
              </span>
            ) : (
              <>
                <Shuffle size={18} />
                <span>Quay Chọn Món Bất Ngờ Ngay →</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Spotlight Result Board */}
        <div ref={rouletteRef} className="lg:col-span-6">
          {/* 1. Idle state */}
          {!pickedDish && !loading && (
            <div className="bg-white dark:bg-card p-6 sm:p-8 rounded-2xl border border-surface-border shadow-card flex flex-col items-center justify-center text-center min-h-[460px]">
              <div className="h-44 sm:h-52 w-full max-w-sm rounded-2xl overflow-hidden shadow-sm border border-surface-border mb-5">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                  alt="Món ăn bất ngờ"
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-surface-text dark:text-foreground tracking-tight">
                Sẵn Sàng Mở Nắp Nồi?
              </h3>
              <p className="text-sm text-surface-muted dark:text-neutral-400 mt-2 max-w-md leading-relaxed">
                Bấm nút quay để bếp trưởng chọn ngẫu nhiên có trọng số món ăn phù hợp nhất với nguyên liệu trong tủ lạnh của bạn.
              </p>

              <button
                type="button"
                onClick={handlePick}
                className="mt-6 px-8 py-3.5 bg-primary text-white font-bold rounded-xl shadow-float hover:bg-primary-hover transition flex items-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                <Sparkles size={18} />
                <span>Quay Món Ngay →</span>
              </button>
            </div>
          )}

          {/* 2. Loading state */}
          {loading && (
            <div className="bg-white dark:bg-card p-12 rounded-2xl border border-surface-border shadow-card flex flex-col items-center justify-center text-center min-h-[460px]">
              <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
              <h3 className="text-xl font-bold text-surface-text dark:text-foreground">
                Đang lục tủ tìm món ngon...
              </h3>
              <p className="text-xs sm:text-sm text-surface-muted dark:text-neutral-400 mt-1 max-w-xs">
                Tính toán xác suất tương thích theo Match Score từ các nguyên liệu đã chọn
              </p>
            </div>
          )}

          {/* 3. Picked Result: Spotlight Dish Card */}
          {pickedDish && !loading && (
            <div className="bg-white dark:bg-card rounded-2xl border border-surface-border shadow-card overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
              {/* Image banner */}
              <div className="relative h-60 sm:h-72 overflow-hidden bg-surface-dim">
                <img
                  src={
                    pickedDish.dish.imageUrl ||
                    getDishImageUrl(
                      pickedDish.dish.name,
                      pickedDish.dish.mealType
                    )
                  }
                  alt={pickedDish.dish.name}
                  className="w-full h-full object-cover"
                />

                {/* Score badge with pulsing dot */}
                <div className="absolute top-3.5 left-3.5 bg-white/95 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-green-700 dark:text-green-400">
                    {Math.round(
                      (pickedDish.matchScore || 0.9) *
                        ((pickedDish.matchScore || 0.9) <= 1 ? 100 : 1)
                    )}
                    % Phù hợp
                  </span>
                </div>

                {/* Favorite button */}
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(pickedDish.dish._id)}
                  className={`absolute top-3.5 right-3.5 p-2.5 rounded-full backdrop-blur-sm transition cursor-pointer shadow-sm ${
                    favoriteIds.includes(pickedDish.dish._id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 dark:bg-neutral-800/90 text-surface-muted hover:text-red-500'
                  }`}
                  title={
                    favoriteIds.includes(pickedDish.dish._id)
                      ? 'Bỏ lưu'
                      : 'Lưu vào sổ tay'
                  }
                >
                  <Heart
                    size={18}
                    fill={
                      favoriteIds.includes(pickedDish.dish._id)
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>

                {/* Category tag */}
                <div className="absolute bottom-3.5 left-3.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold">
                  Gợi Ý Cho Bữa Hôm Nay
                </div>
              </div>

              {/* Content body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-surface-muted mb-1.5">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> 25 phút
                    </span>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Khớp {pickedDish.matchedIngredients || 3}/
                      {pickedDish.totalIngredients || 4} nguyên liệu
                    </span>
                  </div>

                  <h3 className="font-extrabold text-2xl text-surface-text dark:text-foreground">
                    {pickedDish.dish.name}
                  </h3>

                  <p className="text-sm text-surface-muted dark:text-neutral-400 mt-2 leading-relaxed">
                    {pickedDish.dish.description ||
                      'Món ăn thơm ngon, chuẩn vị gia đình được tuyển chọn ngẫu nhiên phù hợp nhất với nguyên liệu sẵn có.'}
                  </p>

                  {/* Ingredients chips */}
                  {pickedDish.dish.ingredients &&
                    pickedDish.dish.ingredients.length > 0 && (
                      <div className="pt-3">
                        <span className="text-xs font-semibold text-surface-muted uppercase tracking-wider block mb-2">
                          Nguyên liệu chính:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {pickedDish.dish.ingredients.map((ing, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2.5 py-1 bg-surface-dim dark:bg-neutral-800 border border-surface-border text-surface-text dark:text-foreground rounded-lg font-medium"
                            >
                              {ing.name}{' '}
                              {ing.quantity ? `(${ing.quantity})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-surface-border flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePick}
                    className="w-full sm:w-auto px-5 py-2.5 bg-surface-dim dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-surface-text dark:text-foreground text-xs sm:text-sm font-bold rounded-xl border border-surface-border transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCw size={15} />
                    <span>Quay món khác</span>
                  </button>

                  <Link
                    to={`/dishes/${pickedDish.dish._id}`}
                    className="w-full sm:flex-1 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-primary-hover shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    <span>Xem công thức chi tiết</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
