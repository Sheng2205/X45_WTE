import { useState, useRef } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { matchApi } from '../api/match.api';
import type { ScoredDish } from '../api/match.api';
import { favoritesApi } from '@/modules/favorites/api/favorites.api';
import { IngredientInput } from '../components/IngredientInput';
import { CriteriaSelector } from '../components/CriteriaSelector';
import { MatchResultCard } from '../components/MatchResultCard';

export function QuickPickPage() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [mealType, setMealType] = useState('');
  const [dietTags, setDietTags] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [pickedDish, setPickedDish] = useState<ScoredDish | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const rouletteRef = useRef<HTMLDivElement>(null);

  const handlePick = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 nguyên liệu có sẵn');
      return;
    }

    setLoading(true);
    setPickedDish(null);
    setIsSaved(false);

    // Smoothly scroll to roulette on mobile
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        rouletteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    try {
      const res = await matchApi.quickPick({
        ingredients: selectedIngredients,
        mealType: mealType || undefined,
        dietTags: dietTags.length ? dietTags : undefined,
        allergens: allergens.length ? allergens : undefined,
      });
      setPickedDish(res.data);
      toast.success('Đã chọn được món bất ngờ cho bạn!');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Không tìm thấy món ăn nào phù hợp với tiêu chí');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!pickedDish) return;
    try {
      await favoritesApi.add(pickedDish.dish._id);
      setIsSaved(true);
      toast.success('Đã lưu vào danh sách món yêu thích!');
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setIsSaved(true);
        toast.info('Món này đã có sẵn trong danh sách yêu thích');
      } else {
        toast.error('Không thể lưu món');
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Quyết định nhanh bằng thuật toán trọng số
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground">
          Hôm Nay Ăn Gì? (Chọn Món Nhanh)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2">
          Đau đầu vì cả nhà mỗi người một ý? Bếp trưởng WhatToEat sẽ quay ngẫu nhiên một món phù hợp nhất với nguyên liệu trong tủ lạnh của bạn!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Pantry & Preference */}
        <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-border/60 pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Thiết Lập Tủ Lạnh
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Chọn nguyên liệu bạn muốn đem vào vòng quay
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

          {/* Direct Pick Button on Mobile */}
          <div className="pt-2 lg:hidden">
            <Button
              onClick={handlePick}
              disabled={loading}
              className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold py-3.5 text-sm sm:text-base shadow-md shadow-orange-600/20 h-12"
            >
              {loading ? 'Đang quay món...' : 'Quay Chọn Món Bất Ngờ Ngay →'}
            </Button>
          </div>
        </div>

        {/* Right Column: Culinary Roulette Board */}
        <div
          ref={rouletteRef}
          className="lg:col-span-7 flex flex-col items-center justify-center min-h-[420px] sm:min-h-[500px] rounded-3xl border border-border/80 bg-card p-8 sm:p-10 text-center scroll-mt-20"
        >
          {!pickedDish && !loading && (
            <div className="space-y-6 max-w-md">
              <div className="mx-auto h-44 sm:h-56 w-full max-w-sm rounded-3xl overflow-hidden shadow-lg border border-border/60">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                  alt="Món ăn bất ngờ"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Sẵn sàng mở nắp nồi?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Bấm nút bên dưới, thuật toán sẽ chọn ngẫu nhiên có trọng số món ăn tương thích nhất với nguyên liệu bạn đã nhập.
                </p>
              </div>
              <Button
                size="lg"
                onClick={handlePick}
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold px-8 sm:px-10 py-6 text-sm sm:text-base shadow-lg shadow-orange-600/25 transition-all hover:scale-105 active:scale-95"
              >
                Quay Chọn Món Bất Ngờ Ngay →
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="space-y-1.5">
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  Đang lục tủ tìm món ngon...
                </p>
                <p className="text-sm text-muted-foreground">
                  Tính toán xác suất tương thích từ các nguyên liệu đã chọn
                </p>
              </div>
            </div>
          )}

          {pickedDish && !loading && (
            <div className="w-full max-w-lg animate-in zoom-in-95 duration-400 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Gợi Ý Hoàn Hảo Cho Bữa Hôm Nay
              </div>

              <div className="text-left">
                <MatchResultCard
                  dish={pickedDish.dish}
                  matchScore={pickedDish.matchScore}
                  matchedIngredients={pickedDish.matchedIngredients}
                  totalIngredients={pickedDish.totalIngredients}
                  isFavorite={isSaved}
                  onToggleFavorite={handleSaveFavorite}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handlePick}
                  className="rounded-full text-sm font-semibold px-5 py-2.5 border-border/80 hover:bg-muted h-11"
                >
                  Quay Món Khác
                </Button>
                <Button
                  onClick={handleSaveFavorite}
                  disabled={isSaved}
                  className="rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-6 py-2.5 shadow-sm flex items-center gap-2 h-11"
                >
                  <Heart className={`size-4 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Đã Lưu Sổ Tay' : 'Lưu Vào Sổ Món Ngon'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
