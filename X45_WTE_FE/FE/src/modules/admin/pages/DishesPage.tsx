import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '../api/admin.api';
import type { Dish } from '../api/admin.api';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { toast } from 'sonner';
import { getDishImageUrl } from '@/shared/lib/dishImages';

const MEAL_LABELS: Record<string, string> = {
  an_sang: 'Bữa sáng',
  an_trua: 'Bữa trưa',
  an_toi: 'Bữa tối',
  an_vat: 'Ăn vặt',
  do_uong: 'Đồ uống',
  mon_nhau: 'Món nhậu',
};

export const DishesPage = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadDishes = async (p = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.getDishes(p, 20);
      setDishes(res.data.dishes);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Lỗi khi tải danh mục món ăn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDishes(page);
  }, [page]);

  const handleSyncTheMealDb = async () => {
    setSyncing(true);
    try {
      const res = await adminApi.syncTheMealDb();
      toast.success(res.data.message || 'Đồng bộ TheMealDB thành công!');
      loadDishes(1);
      setPage(1);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đồng bộ TheMealDB');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa (ẩn) món "${name}" khỏi thực đơn?`)) return;
    try {
      await adminApi.deleteDish(id);
      toast.success('Đã xóa món ăn thành công');
      loadDishes(page);
    } catch (err) {
      toast.error('Lỗi khi xóa món ăn');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Sub-navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Khu Vực Quản Trị
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-text dark:text-foreground mt-1 tracking-tight">
            Quản Lý Món Ăn Bếp Nhà
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub Navigation */}
          <div className="flex rounded-full border border-border/80 bg-muted/40 p-1">
            <Link
              to="/admin/dishes"
              className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold bg-card text-foreground shadow-xs"
            >
              Món Ăn ({total})
            </Link>
            <Link
              to="/admin/ingredients"
              className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Nguyên Liệu
            </Link>
          </div>

          <Button
            variant="outline"
            onClick={handleSyncTheMealDb}
            disabled={syncing}
            className="rounded-full h-10 text-xs sm:text-sm font-semibold px-4 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary transition-all flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`size-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ TheMealDB'}</span>
          </Button>

          <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm px-5 h-10 shadow-xs">
            <Link to="/admin/dishes/new">+ Thêm Món Mới</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-3xl border border-border/60 p-6 space-y-4 bg-card">
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-4">
          <h3 className="font-serif text-2xl font-bold text-foreground">
            Chưa có món ăn nào trong thực đơn
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Hãy bắt đầu tạo món ăn đầu tiên bằng cách bấm vào nút Thêm Món Mới ở trên!
          </p>
          <Button asChild className="rounded-full h-11 px-6 text-sm">
            <Link to="/admin/dishes/new">+ Thêm Món Ngay</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.map((dish) => {
            const imageUrl = dish.imageUrl || getDishImageUrl(dish.name, dish.mealType);
            return (
              <Card
                key={dish._id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {/* Photo Banner */}
                <div className="relative aspect-[4/3] min-h-[220px] w-full overflow-hidden bg-muted">
                  <img
                    src={imageUrl}
                    alt={dish.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-neutral-800 shadow-xs">
                      {MEAL_LABELS[dish.mealType] || dish.mealType}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white">
                      {dish.ingredients?.length || 0} nguyên liệu
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {dish.name}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {dish.description || 'Chưa có mô tả chi tiết.'}
                    </p>

                    {/* Ingredients Pills */}
                    {dish.ingredients && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dish.ingredients.slice(0, 3).map((ing, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          >
                            {ing.name}
                          </span>
                        ))}
                        {dish.ingredients.length > 3 && (
                          <span className="text-xs text-muted-foreground self-center font-medium">
                            +{dish.ingredients.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between border-t border-border/50 pt-3.5 mt-2">
                    <Button variant="ghost" size="sm" asChild className="rounded-full text-xs sm:text-sm hover:bg-muted font-medium">
                      <Link to={`/dishes/${dish._id}`}>Xem trước</Link>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild className="rounded-full text-xs sm:text-sm font-medium">
                        <Link to={`/admin/dishes/${dish._id}/edit`}>Chỉnh sửa</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dish._id, dish.name)}
                        className="rounded-full text-xs sm:text-sm text-destructive hover:bg-destructive/10 font-medium"
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-full text-xs"
          >
            ← Trang Trước
          </Button>
          <span className="text-xs text-muted-foreground">
            Trang {page} / {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full text-xs"
          >
            Trang Sau →
          </Button>
        </div>
      )}
    </div>
  );
};
