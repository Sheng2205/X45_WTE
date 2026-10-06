import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from 'sonner';
import { matchApi } from '../api/match.api';
import type { ScoredDish } from '../api/match.api';
import { favoritesApi } from '@/modules/favorites/api/favorites.api';
import { IngredientInput } from '../components/IngredientInput';
import { CriteriaSelector } from '../components/CriteriaSelector';
import { MatchResultCard } from '../components/MatchResultCard';

export function MatchPage() {
  const location = useLocation();
  const presetNames = location.state?.presetIngredientNames as string[] | undefined;

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [mealType, setMealType] = useState('');
  const [dietTags, setDietTags] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [results, setResults] = useState<ScoredDish[]>([]);
  const [favoriteDishIds, setFavoriteDishIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(true);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    favoritesApi.getAll()
      .then((res) => {
        const ids = (res.data as any[]).map((f) => (f.dish?._id || f.dishId?._id || f.dishId));
        setFavoriteDishIds(ids.filter(Boolean));
      })
      .catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 nguyên liệu có trong tủ lạnh');
      return;
    }

    setLoading(true);
    try {
      const res = await matchApi.match({
        ingredients: selectedIngredients,
        mealType: mealType || undefined,
        dietTags: dietTags.length ? dietTags : undefined,
        allergens: allergens.length ? allergens : undefined,
      });
      setResults(res.data.results);
      setHasSearched(true);
      if (res.data.results.length === 0) {
        toast.info('Không tìm thấy món ăn nào đủ điều kiện');
      } else {
        toast.success(`Tìm thấy ${res.data.results.length} món ăn phù hợp!`);
        // On mobile/tablet, smoothly scroll to results and collapse filter for better visibility
        if (window.innerWidth < 1024) {
          setIsMobileFilterOpen(false);
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.message || 'Có lỗi xảy ra khi tìm món');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (dishId: string) => {
    const isFav = favoriteDishIds.includes(dishId);
    try {
      if (isFav) {
        await favoritesApi.remove(dishId);
        setFavoriteDishIds((prev) => prev.filter((id) => id !== dishId));
        toast.success('Đã bỏ khỏi danh sách yêu thích');
      } else {
        await favoritesApi.add(dishId);
        setFavoriteDishIds((prev) => [...prev, dishId]);
        toast.success('Đã lưu vào sổ tay yêu thích');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật yêu thích');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Phương thức tìm kiếm theo độ tương thích
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mt-1">
          Tìm Món Theo Nguyên Liệu Sẵn Có
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1.5 max-w-3xl leading-relaxed">
          Chọn các nguyên liệu trong tủ lạnh của bạn. Hệ thống sẽ áp dụng thuật toán Match Score để tính tỷ lệ khớp và xếp hạng các món ăn tối ưu nhất.
        </p>
      </div>

      {/* Option A Layout: Left Column (Pantry + Filter) + Right Column (Results Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Sticky Pantry & Filter) */}
        <aside className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Bàn Bếp & Bộ Lọc
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {selectedIngredients.length > 0
                  ? `Đang chọn ${selectedIngredients.length} nguyên liệu`
                  : 'Tùy chỉnh nguyên liệu & chế độ ăn'}
              </p>
            </div>

            {/* Mobile Expand / Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden text-xs font-semibold text-primary hover:underline px-3 py-1.5 rounded-full bg-primary/10"
            >
              {isMobileFilterOpen ? 'Thu gọn ▲' : 'Điều chỉnh ▼'}
            </button>
          </div>

          {/* Collapsible Content on Mobile, Always Visible on Desktop */}
          <div className={`${isMobileFilterOpen ? 'block' : 'hidden lg:block'} space-y-6`}>
            <IngredientInput
              value={selectedIngredients}
              onChange={setSelectedIngredients}
              presetNames={presetNames}
            />

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
              onClick={handleSearch}
              disabled={loading}
              className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold py-3.5 text-sm sm:text-base shadow-md shadow-orange-600/20 transition-all hover:scale-[1.01] h-12"
            >
              {loading ? 'Đang tính toán điểm phù hợp...' : 'Tính Điểm & Tìm Món Ngay'}
            </Button>
          </div>

          {/* Quick Action when Filter is Collapsed on Mobile */}
          {!isMobileFilterOpen && (
            <div className="lg:hidden pt-1 flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground truncate">
                {selectedIngredients.length} nguyên liệu được chọn
              </span>
              <Button
                size="sm"
                onClick={handleSearch}
                disabled={loading}
                className="rounded-full bg-primary text-white text-xs px-4"
              >
                {loading ? 'Đang tính...' : 'Tìm lại →'}
              </Button>
            </div>
          )}
        </aside>

        {/* Right Column: Recipe Cards Grid */}
        <section ref={resultsRef} id="results-section" className="lg:col-span-7 space-y-5 scroll-mt-20">
          {hasSearched && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-border/70 bg-card px-5 py-3 text-sm text-muted-foreground">
              <span>
                Tìm thấy <strong>{results.length}</strong> món ăn phù hợp
              </span>
              <span className="font-semibold text-foreground">Xếp theo % Match Score giảm dần</span>
            </div>
          )}

          {/* Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-3xl border border-border/60 p-6 space-y-4 bg-card">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl min-h-[220px]" />
                  <Skeleton className="h-7 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-full" />
                </div>
              ))}
            </div>
          )}

          {/* Initial State with realistic culinary illustration */}
          {!loading && !hasSearched && (
            <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center space-y-5 overflow-hidden relative">
              <div className="max-w-lg mx-auto space-y-4">
                <div className="h-40 sm:h-52 w-full rounded-3xl overflow-hidden shadow-inner bg-muted mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                    alt="Bàn ăn gia đình thơm ngon"
                    className="h-full w-full object-cover opacity-90"
                  />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Gian Bếp Đang Chờ Bạn
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Chọn các nguyên liệu bạn đang có ở cột bên trái và bấm <strong>Tính Điểm & Tìm Món Ngay</strong>. WhatToEat sẽ tính toán công thức phù hợp nhất để bạn không lãng phí bất kỳ đồ ăn nào.
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && hasSearched && results.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border/80 bg-card p-10 sm:p-14 text-center space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Chưa tìm thấy món ăn nào khớp
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Có thể do các món hiện có bị loại trừ bởi tiêu chí dị ứng hoặc danh mục chưa có món sử dụng kết hợp nguyên liệu này. Bạn hãy thử bỏ bớt điều kiện lọc hoặc chọn thêm nguyên liệu phụ nhé.
              </p>
            </div>
          )}

          {/* Results Grid with Photos */}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {results.map((item) => (
                <MatchResultCard
                  key={item.dish._id}
                  dish={item.dish}
                  matchScore={item.matchScore}
                  matchedIngredients={item.matchedIngredients}
                  totalIngredients={item.totalIngredients}
                  isFavorite={favoriteDishIds.includes(item.dish._id)}
                  onToggleFavorite={() => toggleFavorite(item.dish._id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
