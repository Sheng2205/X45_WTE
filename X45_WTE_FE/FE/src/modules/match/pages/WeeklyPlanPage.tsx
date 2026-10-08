import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCw,
  ShoppingBag,
  AlertCircle,
  Clock,
  Sparkles,
  CalendarDays,
  Plus,
  Trash2,
  Search,
  Check,
  Heart,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { favoritesApi } from '@/modules/favorites/api/favorites.api';
import { getDishImageUrl } from '@/shared/lib/dishImages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';
import { dishService, type ScoredDish, type Dish } from '../api/match.api';

const DAYS_OF_WEEK = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
];

const MEAL_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'an_sang', label: 'Bữa sáng' },
  { value: 'an_trua', label: 'Bữa trưa' },
  { value: 'an_toi', label: 'Bữa tối' },
  { value: 'an_vat', label: 'Ăn vặt' },
];

interface PlanItem {
  day: number;
  dish: ScoredDish['dish'];
  matchScore: number;
}

const LOCAL_STORAGE_CUSTOM_PLAN_KEY = 'wte_custom_weekly_plan_v2';

export function WeeklyPlanPage() {
  const [activeTab, setActiveTab] = useState<'auto' | 'custom'>('auto');

  // --- Auto mode state ---
  const [autoPlan, setAutoPlan] = useState<PlanItem[]>([]);
  const [hasRepeat, setHasRepeat] = useState(false);
  const [loadingAuto, setLoadingAuto] = useState(false);

  // --- Custom mode state ---
  const [customPlan, setCustomPlan] = useState<(Dish | null)[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PLAN_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch {}
    return Array(7).fill(null);
  });

  // Dialog picker state
  const [pickerDayIndex, setPickerDayIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerMealType, setPickerMealType] = useState('');
  const [pickerSource, setPickerSource] = useState<'all' | 'favorites'>('all');
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([]);
  const [favoriteDishes, setFavoriteDishes] = useState<Dish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);

  const navigate = useNavigate();

  // Load auto plan on mount
  const fetchAutoPlan = async () => {
    setLoadingAuto(true);
    try {
      const res = await dishService.getWeeklyPlan({
        days: 7,
        ingredients: [
          'Trứng gà',
          'Cà chua',
          'Thịt bò',
          'Thịt ba chỉ',
          'Hành lá',
          'Đậu phụ',
        ],
      });
      setAutoPlan(res.plan || []);
      setHasRepeat(Boolean(res.hasRepeat));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Có lỗi khi tạo thực đơn tuần');
    } finally {
      setLoadingAuto(false);
    }
  };

  useEffect(() => {
    fetchAutoPlan();
  }, []);

  // Save custom plan to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_CUSTOM_PLAN_KEY,
        JSON.stringify(customPlan)
      );
    } catch {}
  }, [customPlan]);

  // Load favorites for picker
  useEffect(() => {
    favoritesApi
      .getAll()
      .then((res) => {
        const items = (res.data as any[])
          .map((f) => f.dish || f.dishId)
          .filter(Boolean);
        setFavoriteDishes(items);
      })
      .catch(() => {});
  }, []);

  // Fetch dishes for picker dialog
  const loadDishesForPicker = async () => {
    setLoadingDishes(true);
    try {
      const res = await dishService.getDishes({
        limit: 50,
        search: pickerSearch || undefined,
        mealType: pickerMealType || undefined,
      });
      setAvailableDishes(res.dishes || []);
    } catch {
      setAvailableDishes([]);
    } finally {
      setLoadingDishes(false);
    }
  };

  useEffect(() => {
    if (pickerDayIndex !== null && pickerSource === 'all') {
      const timer = setTimeout(() => {
        loadDishesForPicker();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pickerDayIndex, pickerSearch, pickerMealType, pickerSource]);

  // --- Auto Plan KPI Stats ---
  const autoAvgScore = autoPlan.length
    ? Math.round(
        (autoPlan.reduce(
          (sum, item) => sum + (item.matchScore || 0.8),
          0
        ) /
          autoPlan.length) *
          100
      )
    : 85;

  const autoReadyDays = autoPlan.length
    ? autoPlan.filter((item) => (item.matchScore || 0.8) >= 0.7).length
    : 5;

  const autoExtraItems: string[] = [];
  autoPlan.forEach((item) => {
    item.dish?.ingredients?.forEach((ing) => {
      if (
        ing.name &&
        !autoExtraItems.includes(ing.name) &&
        autoExtraItems.length < 3
      ) {
        autoExtraItems.push(
          `${ing.name} ${ing.quantity ? `(${ing.quantity})` : ''}`
        );
      }
    });
  });

  // --- Custom Plan Calculations ---
  const customFilledCount = customPlan.filter(Boolean).length;
  const customIngredientsSet = new Set<string>();
  customPlan.forEach((d) => {
    d?.ingredients?.forEach((ing) => {
      if (ing.name) customIngredientsSet.add(ing.name.trim());
    });
  });
  const customIngredientsList = Array.from(customIngredientsSet);

  const handleSelectDishForDay = (dish: Dish) => {
    if (pickerDayIndex === null) return;
    const updated = [...customPlan];
    updated[pickerDayIndex] = dish;
    setCustomPlan(updated);
    toast.success(`Đã chọn ${dish.name} cho ${DAYS_OF_WEEK[pickerDayIndex]}!`);
    setPickerDayIndex(null);
  };

  const handleRemoveDishFromDay = (index: number) => {
    const updated = [...customPlan];
    updated[index] = null;
    setCustomPlan(updated);
    toast.info(`Đã bỏ món khỏi ${DAYS_OF_WEEK[index]}`);
  };

  const handleClearCustomPlan = () => {
    setCustomPlan(Array(7).fill(null));
    toast.info('Đã đặt lại toàn bộ thực đơn tuần tự soạn');
  };

  const handleAutoFillEmptySlots = async () => {
    const emptyIndices = customPlan
      .map((dish, i) => (dish === null ? i : -1))
      .filter((i) => i !== -1);

    if (emptyIndices.length === 0) {
      toast.info('Tất cả các ngày trong tuần đã được chọn món!');
      return;
    }

    try {
      // Pick random candidates from available dishes or auto plan
      const pool =
        availableDishes.length > 0
          ? availableDishes
          : autoPlan.map((p) => p.dish).filter(Boolean);

      if (pool.length === 0) {
        toast.error('Chưa tải được danh sách món ăn để điền tự động');
        return;
      }

      const updated = [...customPlan];
      let poolIdx = 0;
      emptyIndices.forEach((dayIdx) => {
        const dishToPick = pool[poolIdx % pool.length];
        updated[dayIdx] = dishToPick;
        poolIdx++;
      });
      setCustomPlan(updated);
      toast.success(
        `Đã tự động điền ${emptyIndices.length} ngày còn trống!`
      );
    } catch {
      toast.error('Không thể điền tự động');
    }
  };

  const handleCopyShoppingList = () => {
    const items =
      activeTab === 'auto'
        ? autoExtraItems
        : customIngredientsList;
    if (items.length === 0) {
      toast.info('Chưa có nguyên liệu nào trong danh sách mua sắm');
      return;
    }
    const text = `Danh sách mua sắm thực đơn tuần WhatToEat:\n` + items.map((i) => `- ${i}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép danh sách đi chợ vào bộ nhớ tạm!');
  };

  // Filtered dishes for dialog
  const displayedDialogDishes =
    pickerSource === 'favorites'
      ? favoriteDishes.filter((d) => {
          const matchName = pickerSearch
            ? d.name.toLowerCase().includes(pickerSearch.toLowerCase())
            : true;
          const matchMeal = pickerMealType ? d.mealType === pickerMealType : true;
          return matchName && matchMeal;
        })
      : availableDishes;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Title & Mode Switcher Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-surface-border pb-6">
        <div>
          <span className="text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/60 px-3 py-1 rounded-full uppercase tracking-wider">
            An Toàn Dinh Dưỡng
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-text dark:text-foreground mt-2 tracking-tight">
            Thực Đơn Tuần Của Bạn
          </h1>
          <p className="text-sm text-surface-muted dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Lên kế hoạch ăn uống ấm cúng cho cả tuần, tối ưu từ nguyên liệu có sẵn trong tủ lạnh hoặc tự do thiết kế theo khẩu vị gia đình.
          </p>
        </div>

        {/* 2-Option Segmented Control */}
        <div className="flex items-center gap-1.5 p-1.5 bg-surface-dim dark:bg-neutral-800/80 rounded-2xl border border-surface-border shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('auto')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'auto'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-muted dark:text-neutral-400 hover:text-surface-text dark:hover:text-white'
            }`}
          >
            <Sparkles size={16} />
            <span>Gợi Ý Theo Tủ Lạnh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-muted dark:text-neutral-400 hover:text-surface-text dark:hover:text-white'
            }`}
          >
            <CalendarDays size={16} />
            <span>Tự Soạn Thực Đơn</span>
            {customFilledCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {customFilledCount}/7
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: AUTO / GỢI Ý THEO TỦ LẠNH                         */}
      {/* ========================================================= */}
      {activeTab === 'auto' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-surface-text dark:text-foreground">
                Thực Đơn Tự Động 7 Ngày
              </h2>
              <p className="text-xs sm:text-sm text-surface-muted dark:text-neutral-400">
                Thuật toán tối ưu hoá phân bổ món ăn theo nguyên liệu có sẵn để hạn chế lặp món.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchAutoPlan}
              disabled={loadingAuto}
              className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-sm transition flex items-center gap-2 self-start sm:self-auto text-sm cursor-pointer disabled:opacity-70"
            >
              <RotateCw size={16} className={loadingAuto ? 'animate-spin' : ''} />
              <span>{loadingAuto ? 'Đang tạo...' : 'Đổi thực đơn tuần mới'}</span>
            </button>
          </div>

          {/* Repeat Alert (BR-7) */}
          {hasRepeat && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <span>
                Thực đơn tuần có lặp lại món do số lượng nguyên liệu an toàn trong tủ có hạn. Bạn có thể thêm nguyên liệu để thực đơn phong phú hơn!
              </span>
            </div>
          )}

          {/* KPI Stats Bar (Spec 3.4) */}
          <div className="bg-surface-dim dark:bg-neutral-800/60 px-6 py-3.5 rounded-xl border border-surface-border flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-surface-text dark:text-foreground">
            <div>
              Độ phù hợp: <span className="text-primary font-bold">{autoAvgScore}%</span>
            </div>
            <div className="w-px h-4 bg-surface-border hidden md:block"></div>
            <div>
              Sẵn sàng: <span className="text-green-600 dark:text-green-400 font-bold">{autoReadyDays}/7 ngày</span>
            </div>
            <div className="w-px h-4 bg-surface-border hidden md:block"></div>
            <div>
              Cần mua thêm: <span className="text-red-500 font-bold">{autoExtraItems.length || 2} món phụ</span>
            </div>
            <div className="w-px h-4 bg-surface-border hidden md:block"></div>
            <div>
              Thời gian nấu TB: <span className="text-surface-muted dark:text-neutral-400 font-bold">25 phút/ngày</span>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loadingAuto && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-white dark:bg-card rounded-2xl border border-surface-border animate-pulse p-4"
                />
              ))}
            </div>
          )}

          {/* 7-Day Grid */}
          {!loadingAuto && autoPlan.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {autoPlan.map((item, index) => {
                const percentage = Math.round(
                  (item.matchScore || 0.85) * (item.matchScore <= 1 ? 100 : 1)
                );
                const imageUrl =
                  item.dish?.imageUrl ||
                  getDishImageUrl(item.dish?.name, item.dish?.mealType);

                return (
                  <div
                    key={index}
                    onClick={() => item.dish?._id && navigate(`/dishes/${item.dish._id}`)}
                    className="bg-white dark:bg-card rounded-2xl border border-surface-border shadow-card overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="relative h-40 overflow-hidden bg-surface-dim">
                      <img
                        src={imageUrl}
                        alt={item.dish?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-surface-text dark:text-foreground flex items-center gap-1 shadow-sm">
                        <span>{DAYS_OF_WEEK[index] || `Ngày ${index + 1}`}</span>
                        <span className="text-green-600 dark:text-green-400">• {percentage}%</span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-surface-text dark:text-foreground group-hover:text-primary transition line-clamp-1">
                          {item.dish?.name}
                        </h3>
                        <p className="text-xs text-surface-muted dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.dish?.description ||
                            'Món ăn thơm ngon, chuẩn vị gia đình Việt cho bữa cơm sum vầy.'}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-surface-muted dark:text-neutral-400 border-t border-surface-border pt-2.5">
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {item.dish?.mealType === 'do_uong' ? '10p' : '25p'}
                        </span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Đủ nguyên liệu
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Shopping Helper Bar */}
          <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl border border-surface-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-primary flex items-center justify-center shrink-0">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface-text dark:text-foreground">
                  Cần mua thêm cho tuần ({autoExtraItems.length || 2} món)
                </h4>
                <p className="text-xs text-surface-muted dark:text-neutral-400">
                  Tối ưu theo các món cần bổ sung nguyên liệu trong thực đơn
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              {autoExtraItems.length > 0 ? (
                autoExtraItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-surface-dim dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-surface-border font-medium text-surface-text dark:text-foreground"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <>
                  <span className="text-xs bg-surface-dim dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-surface-border font-medium text-surface-text dark:text-foreground">
                    Nước dừa tươi (1 lon)
                  </span>
                  <span className="text-xs bg-surface-dim dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-surface-border font-medium text-surface-text dark:text-foreground">
                    Thịt nạc băm (200g)
                  </span>
                </>
              )}

              <button
                type="button"
                onClick={handleCopyShoppingList}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition cursor-pointer"
              >
                Sao chép đi chợ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CUSTOM / NGƯỜI DÙNG TỰ SOẠN THỰC ĐƠN              */}
      {/* ========================================================= */}
      {activeTab === 'custom' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-surface-text dark:text-foreground">
                  Tự Soạn Thực Đơn Tuần (7 Ngày)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-light text-primary dark:bg-orange-950/60 dark:text-orange-300 text-xs font-bold">
                  Đã chọn {customFilledCount}/7 ngày
                </span>
              </div>
              <p className="text-xs sm:text-sm text-surface-muted dark:text-neutral-400 mt-0.5">
                Chạm vào từng ngày để thêm món từ kho công thức hoặc sổ tay món yêu thích.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleAutoFillEmptySlots}
                className="px-4 py-2 bg-surface-dim dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-surface-text dark:text-foreground border border-surface-border rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={15} className="text-primary" />
                <span>Điền ngày trống</span>
              </button>

              <button
                type="button"
                onClick={handleClearCustomPlan}
                className="px-4 py-2 bg-surface-dim dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-surface-muted hover:text-red-600 border border-surface-border rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Đặt lại</span>
              </button>
            </div>
          </div>

          {/* 7-Day Interactive Custom Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DAYS_OF_WEEK.map((dayName, idx) => {
              const dish = customPlan[idx];

              if (!dish) {
                // Empty Slot Card
                return (
                  <div
                    key={idx}
                    onClick={() => setPickerDayIndex(idx)}
                    className="h-64 rounded-2xl border-2 border-dashed border-surface-border hover:border-primary/60 bg-white/60 dark:bg-card/40 hover:bg-primary/5 transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer group shadow-2xs"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-surface-dim dark:bg-neutral-800 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-colors shadow-2xs mb-3">
                      <Plus size={22} />
                    </div>
                    <span className="font-bold text-base text-surface-text dark:text-foreground">
                      {dayName}
                    </span>
                    <span className="text-xs text-surface-muted dark:text-neutral-400 mt-1">
                      Chưa chọn món
                    </span>
                    <button
                      type="button"
                      className="mt-4 px-4 py-1.5 rounded-full bg-surface-dim dark:bg-neutral-800 group-hover:bg-primary group-hover:text-white text-xs font-bold transition-colors"
                    >
                      + Chọn món ăn
                    </button>
                  </div>
                );
              }

              // Assigned Dish Card
              const imageUrl =
                dish.imageUrl || getDishImageUrl(dish.name, dish.mealType);

              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-card rounded-2xl border border-surface-border shadow-card overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
                >
                  <div className="relative h-40 overflow-hidden bg-surface-dim group">
                    <img
                      src={imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-surface-text dark:text-foreground shadow-sm">
                      {dayName}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDishFromDay(idx);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 hover:bg-red-600 text-white transition backdrop-blur-sm"
                      title="Bỏ món này"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-surface-text dark:text-foreground line-clamp-1">
                        {dish.name}
                      </h3>
                      <p className="text-xs text-surface-muted dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {dish.description ||
                          'Món ăn gia đình thơm ngon, giàu hương vị.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPickerDayIndex(idx)}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Đổi món khác
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/dishes/${dish._id}`)}
                        className="text-xs text-surface-muted hover:text-surface-text font-medium flex items-center gap-0.5 cursor-pointer"
                      >
                        Chi tiết <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Shopping Helper Bar */}
          <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl border border-surface-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-primary flex items-center justify-center shrink-0">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-surface-text dark:text-foreground">
                  Tổng nguyên liệu cho thực đơn tự soạn ({customIngredientsList.length} món)
                </h4>
                <p className="text-xs text-surface-muted dark:text-neutral-400">
                  Tổng hợp danh sách các nguyên liệu cần chuẩn bị cho các món bạn đã chọn
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              {customIngredientsList.slice(0, 4).map((name, i) => (
                <span
                  key={i}
                  className="text-xs bg-surface-dim dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-surface-border font-medium text-surface-text dark:text-foreground"
                >
                  {name}
                </span>
              ))}

              {customIngredientsList.length > 4 && (
                <span className="text-xs text-surface-muted font-medium">
                  +{customIngredientsList.length - 4} khác
                </span>
              )}

              <button
                type="button"
                onClick={handleCopyShoppingList}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition cursor-pointer shrink-0"
              >
                Sao chép đi chợ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DISH PICKER DIALOG FOR CUSTOM PLAN                        */}
      {/* ========================================================= */}
      <Dialog
        open={pickerDayIndex !== null}
        onOpenChange={(open) => !open && setPickerDayIndex(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-surface-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-surface-text dark:text-foreground">
              Chọn Món Cho{' '}
              <span className="text-primary">
                {pickerDayIndex !== null ? DAYS_OF_WEEK[pickerDayIndex] : ''}
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Dialog Source Switcher + Search Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPickerSource('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  pickerSource === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-surface-dim dark:bg-neutral-800 text-surface-muted hover:text-surface-text'
                }`}
              >
                Tất Cả Món Ăn
              </button>

              <button
                type="button"
                onClick={() => setPickerSource('favorites')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  pickerSource === 'favorites'
                    ? 'bg-primary text-white'
                    : 'bg-surface-dim dark:bg-neutral-800 text-surface-muted hover:text-surface-text'
                }`}
              >
                <Heart size={13} className={pickerSource === 'favorites' ? 'fill-current' : ''} />
                <span>Món Yêu Thích ({favoriteDishes.length})</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
                />
                <input
                  type="text"
                  placeholder="Tìm món theo tên (phở bò, canh chua, gà nướng...)"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-surface-border bg-surface-dim dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-surface-text dark:text-foreground"
                />
              </div>
            </div>

            {/* Filter by Meal Type */}
            <div className="flex flex-wrap gap-1.5">
              {MEAL_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPickerMealType(opt.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    pickerMealType === opt.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-surface-border bg-white dark:bg-neutral-800 text-surface-muted hover:text-surface-text'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1 mt-3 max-h-[45vh]">
            {loadingDishes && (
              <div className="text-center py-10 text-xs text-surface-muted animate-pulse">
                Đang tải danh sách món ăn...
              </div>
            )}

            {!loadingDishes && displayedDialogDishes.length === 0 && (
              <div className="text-center py-10 text-xs text-surface-muted">
                Không tìm thấy món ăn phù hợp với từ khóa này.
              </div>
            )}

            {!loadingDishes &&
              displayedDialogDishes.map((dish) => {
                const img =
                  dish.imageUrl || getDishImageUrl(dish.name, dish.mealType);
                const isCurrent =
                  pickerDayIndex !== null &&
                  customPlan[pickerDayIndex]?._id === dish._id;

                return (
                  <div
                    key={dish._id}
                    onClick={() => handleSelectDishForDay(dish)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-primary bg-primary-light/40 dark:bg-orange-950/40'
                        : 'border-surface-border hover:border-primary/60 hover:bg-surface-dim dark:hover:bg-neutral-800/60 bg-white dark:bg-card'
                    }`}
                  >
                    <img
                      src={img}
                      alt={dish.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-surface-text dark:text-foreground truncate">
                          {dish.name}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                            <Check size={12} /> Đang chọn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-muted dark:text-neutral-400 truncate mt-0.5">
                        {dish.description || 'Món ăn gia đình thơm ngon'}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-surface-muted mt-1">
                        <span>{dish.ingredients?.length || 0} nguyên liệu</span>
                        <span>•</span>
                        <span>{dish.mealType}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition shrink-0 cursor-pointer"
                    >
                      Chọn
                    </button>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
