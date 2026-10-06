import { useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from 'sonner';
import { matchApi } from '../api/match.api';
import type { ScoredDish } from '../api/match.api';
import { IngredientInput } from '../components/IngredientInput';
import { CriteriaSelector } from '../components/CriteriaSelector';
import { MatchResultCard } from '../components/MatchResultCard';

interface PlanDay {
  day: number;
  dish: ScoredDish['dish'];
  matchScore: number;
}

const DAY_LABELS = [
  'Thứ Hai (Ngày 1)',
  'Thứ Ba (Ngày 2)',
  'Thứ Tư (Ngày 3)',
  'Thứ Năm (Ngày 4)',
  'Thứ Sáu (Ngày 5)',
  'Thứ Bảy (Ngày 6)',
  'Chủ Nhật (Ngày 7)',
];

export function WeeklyPlanPage() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [mealType, setMealType] = useState('');
  const [dietTags, setDietTags] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [hasRepeat, setHasRepeat] = useState(false);
  const [loading, setLoading] = useState(false);

  const planRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 nguyên liệu có trong tủ lạnh');
      return;
    }

    setLoading(true);
    try {
      const res = await matchApi.weeklyPlan({
        ingredients: selectedIngredients,
        mealType: mealType || undefined,
        dietTags: dietTags.length ? dietTags : undefined,
        allergens: allergens.length ? allergens : undefined,
        days: 7,
      });
      setPlan(res.data.plan);
      setHasRepeat(res.data.hasRepeat);
      toast.success('Đã lên xong thực đơn 7 ngày cho bạn!');

      // Smooth scroll on mobile
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Có lỗi xảy ra khi tạo thực đơn tuần');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Kế hoạch bữa cơm gia đình
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mt-1">
          Thực Đơn 7 Ngày Trong Tuần
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-3xl leading-relaxed">
          Tối ưu hoá tủ lạnh, chủ động danh sách đi chợ và không còn cảnh đau đầu nghĩ "hôm nay ăn gì" mỗi buổi chiều.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Filter Panel */}
        <div className="lg:col-span-4 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-24">
          <div className="border-b border-border/60 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Thiết Lập Tuần
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Nguyên liệu có sẵn & chế độ ăn gia đình
            </p>
          </div>

          <IngredientInput value={selectedIngredients} onChange={setSelectedIngredients} />

          <div className="border-t border-border/60 pt-5">
            <CriteriaSelector
              mealType={mealType}
              onMealTypeChange={setMealType}
              dietTags={dietTags}
              onDietTagsChange={setDietTags}
              allergens={allergens}
              onAllergensChange={setAllergens}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold py-3.5 text-sm sm:text-base shadow-md shadow-orange-600/20 transition-all hover:scale-[1.01] h-12"
          >
            {loading ? 'Đang phân bổ thực đơn 7 ngày...' : plan.length ? 'Lập Lại Thực Đơn Mới' : 'Lên Thực Đơn 7 Ngày Ngay'}
          </Button>
        </div>

        {/* Right Column: 7 Days Board */}
        <div ref={planRef} className="lg:col-span-8 space-y-5 scroll-mt-20">
          {hasRepeat && plan.length > 0 && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4.5 text-sm text-amber-900 dark:text-amber-200">
              <strong>Lưu ý về thực đơn:</strong> Số món ăn phù hợp với nguyên liệu của bạn ít hơn 7 món, vì vậy hệ thống đã lặp lại một số món ngon nhất để đảm bảo đủ 7 ngày.
            </div>
          )}

          {!hasRepeat && plan.length > 0 && (
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-900 dark:text-emerald-200">
              <strong>Thực đơn lý tưởng:</strong> Cả tuần 7 ngày phong phú, không lặp lại món nào!
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="rounded-3xl border border-border/60 p-6 space-y-4 bg-card">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl min-h-[220px]" />
                  <Skeleton className="h-7 w-3/4 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && plan.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card p-8 sm:p-12 text-center space-y-5">
              <div className="mx-auto h-40 sm:h-52 w-full max-w-sm rounded-3xl overflow-hidden shadow-inner bg-muted mb-3">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
                  alt="Thực đơn tuần"
                  className="h-full w-full object-cover opacity-85"
                />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                Chưa có thực đơn nào cho tuần này
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Nhập nguyên liệu bạn dự định mua hoặc đang có sẵn ở cột bên trái, rồi bấm <strong>Lên Thực Đơn 7 Ngày Ngay</strong> để xem lịch trình nấu nướng gọn gàng, tiện lợi!
              </p>
            </div>
          )}

          {/* 7 Days Grid */}
          {!loading && plan.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {plan.map((item, index) => {
                const totalCount = item.dish.ingredients?.length || 1;
                const matchedCount = item.dish.ingredients?.filter((ing) =>
                  selectedIngredients.includes(ing.ingredientId)
                ).length || 0;

                return (
                  <div key={item.day} className="space-y-2.5">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        {DAY_LABELS[index] || `Ngày ${item.day}`}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        Bữa chính
                      </span>
                    </div>

                    <MatchResultCard
                      dish={item.dish}
                      matchScore={item.matchScore}
                      matchedIngredients={matchedCount}
                      totalIngredients={totalCount}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
