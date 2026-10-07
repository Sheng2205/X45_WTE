import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { favoritesApi } from '../api/favorites.api';
import { DishCard } from '@/components/dishes/DishCard';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadFavorites = async () => {
    try {
      const res = await favoritesApi.getAll();
      setFavorites(res.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách món yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemove = async (dishId: string) => {
    try {
      await favoritesApi.remove(dishId);
      toast.success('Đã xóa khỏi sổ tay yêu thích');
      setFavorites((prev) =>
        prev.filter((f) => {
          const d = f.dish || f.dishId;
          return d?._id !== dishId;
        })
      );
    } catch {
      toast.error('Lỗi khi xóa món yêu thích');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl border border-surface-border bg-white dark:bg-card p-4 space-y-4"
            >
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter out any entries where dish is null (e.g. if deleted)
  const validFavorites = favorites.filter((f) => Boolean(f.dish || f.dishId));

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Bộ sưu tập cá nhân
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-text dark:text-foreground mt-1.5 tracking-tight">
          Sổ Tay Món Yêu Thích
        </h1>
        <p className="text-sm text-surface-muted dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Tất cả những món ăn bạn tâm đắc được lưu trữ tại đây để bạn có thể xem lại công thức và lên lịch nấu bất cứ lúc nào.
        </p>
      </div>

      {validFavorites.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-surface-border bg-white dark:bg-card p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
            <Heart size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-surface-text dark:text-foreground">
              Sổ tay món ăn đang còn trống
            </h3>
            <p className="text-sm text-surface-muted dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
              Bạn chưa lưu món ăn nào. Khi tìm món hoặc quay chọn ngẫu nhiên, hãy chạm vào biểu tượng trái tim để lưu lại công thức nhé!
            </p>
          </div>
          <Link
            to="/kham-pha"
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm px-6 py-3 shadow-float transition"
          >
            <Sparkles size={16} />
            <span>Khám Phá Món Ngay</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {validFavorites.map((item) => {
            const dish = item.dish || item.dishId;
            if (!dish || !dish._id) return null;

            return (
              <DishCard
                key={dish._id}
                dish={dish}
                matchScore={0.9}
                isFavorite={true}
                onToggleFavorite={handleRemove}
                onSelect={() => navigate(`/dishes/${dish._id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
