import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, SlidersHorizontal, Sparkles } from 'lucide-react';
import { DishCard } from '../components/DishCard';
import { favoritesApi } from '@/modules/favorites/api/favorites.api';
import { matchApi } from '../api/match.api';
import { toast } from 'sonner';
import type { ScoredDish } from '../api/match.api';

export const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateResults = location.state?.results as ScoredDish[] | undefined;
  const filterPayload = location.state?.filterPayload;

  const [results, setResults] = useState<ScoredDish[]>(stateResults || []);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(!stateResults);

  // Load favorites
  useEffect(() => {
    favoritesApi.getAll()
      .then((res) => {
        const items = res.data as Array<{ dish?: { _id: string }; dishId?: string | { _id: string } }>;
        const ids = items.map((f) => {
          if (f.dish?._id) return f.dish._id;
          if (typeof f.dishId === 'string') return f.dishId;
          if (f.dishId?._id) return f.dishId._id;
          return '';
        });
        setFavoriteIds(ids.filter(Boolean));
      })
      .catch(() => {});
  }, []);

  // If user navigated directly to /ket-qua without state, fetch with default pantry
  useEffect(() => {
    if (!stateResults) {
      matchApi.getMatchDishes({
        ingredients: ['Trứng gà', 'Cà chua', 'Thịt bò'],
      })
        .then((res) => setResults(res.results || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }
  }, [stateResults]);

  const toggleFavorite = async (dishId: string) => {
    const isFav = favoriteIds.includes(dishId);
    try {
      if (isFav) {
        await favoritesApi.remove(dishId);
        setFavoriteIds((prev) => prev.filter((id) => id !== dishId));
        toast.success('Đã bỏ lưu món');
      } else {
        await favoritesApi.add(dishId);
        setFavoriteIds((prev) => [...prev, dishId]);
        toast.success('Đã lưu vào danh sách yêu thích!');
      }
    } catch {
      toast.error('Không thể cập nhật yêu thích');
    }
  };

  const ingredientNames = filterPayload?.ingredients || ['Nguyên liệu đã chọn'];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top action and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/kham-pha')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-surface-muted hover:text-primary transition mb-2"
          >
            <ArrowLeft size={16} /> Quay lại tủ lạnh
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-text dark:text-foreground tracking-tight">
            Gợi Ý Món Ăn Cho Bạn
          </h1>
          <p className="text-surface-muted dark:text-neutral-400 mt-1 text-sm sm:text-base">
            Các món ăn được tính toán theo độ tương thích (Match Score) giảm dần.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/kham-pha')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-dim dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 text-surface-text dark:text-foreground text-xs sm:text-sm font-semibold rounded-xl border border-surface-border transition self-start sm:self-auto"
        >
          <SlidersHorizontal size={16} /> Chỉnh sửa bộ lọc
        </button>
      </div>

      {/* Selected Ingredients Pill Bar */}
      {ingredientNames.length > 0 && (
        <div className="p-4 bg-white dark:bg-card rounded-2xl border border-surface-border shadow-2xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-surface-muted dark:text-neutral-400 uppercase tracking-wider mr-1">
            Đang tìm theo:
          </span>
          {ingredientNames.map((name: string) => (
            <span
              key={name}
              className="text-xs font-semibold px-3 py-1 bg-primary-light text-primary dark:bg-orange-950/60 dark:text-orange-300 rounded-full"
            >
              {name}
            </span>
          ))}
          <span className="text-xs text-surface-muted dark:text-neutral-400 ml-auto font-medium">
            Tìm thấy <strong>{results.length}</strong> món phù hợp
          </span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-72 bg-white dark:bg-card rounded-2xl border border-surface-border animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="h-40 bg-surface-dim dark:bg-neutral-800 rounded-xl" />
              <div className="space-y-2 pt-3">
                <div className="h-4 bg-surface-dim dark:bg-neutral-800 rounded w-3/4" />
                <div className="h-3 bg-surface-dim dark:bg-neutral-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div className="bg-white dark:bg-card p-10 sm:p-14 rounded-2xl border border-surface-border shadow-card text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-primary flex items-center justify-center mx-auto">
            <Sparkles size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-surface-text dark:text-foreground">
            Chưa tìm thấy món ăn phù hợp
          </h2>
          <p className="text-surface-muted dark:text-neutral-400 text-sm leading-relaxed">
            Có thể do tiêu chí loại trừ dị ứng quá nghiêm ngặt hoặc tủ lạnh chưa có đủ nguyên liệu chính. Bạn hãy thử thêm vài nguyên liệu phổ biến khác nhé.
          </p>
          <div className="pt-2">
            <Link
              to="/kham-pha"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-float hover:bg-primary-hover transition text-sm"
            >
              Quay lại tủ lạnh thêm đồ
            </Link>
          </div>
        </div>
      )}

      {/* Results Grid with DishCard */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((item) => (
            <DishCard
              key={item.dish._id}
              dish={item.dish}
              matchScore={item.matchScore}
              isFavorite={favoriteIds.includes(item.dish._id)}
              onToggleFavorite={toggleFavorite}
              onSelect={() => navigate(`/dishes/${item.dish._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
