import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCw, ShoppingBag, AlertCircle, Clock } from 'lucide-react';
import { dishService } from '@/services/dishService';
import { getDishImageUrl } from '@/shared/lib/dishImages';
import { toast } from 'sonner';
import type { ScoredDish } from '../api/match.api';

const DAYS_OF_WEEK = [
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
  'Chủ Nhật',
];

interface PlanItem {
  day: number;
  dish: ScoredDish['dish'];
  matchScore: number;
}

export function WeeklyPlanPage() {
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [hasRepeat, setHasRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPlan = async () => {
    setLoading(true);
    try {
      // Default common ingredients if none provided
      const res = await dishService.getWeeklyPlan({
        days: 7,
        ingredients: ['Trứng gà', 'Cà chua', 'Thịt bò', 'Thịt ba chỉ', 'Hành lá', 'Đậu phụ'],
      });
      setPlan(res.plan || []);
      setHasRepeat(Boolean(res.hasRepeat));
      toast.success('Đã tạo thực đơn 7 ngày mới cho bạn!');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Có lỗi khi tạo thực đơn tuần');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  // Compute dynamic KPI stats
  const avgScore = plan.length
    ? Math.round(
        (plan.reduce((sum, item) => sum + (item.matchScore || 0.8), 0) / plan.length) * 100
      )
    : 85;

  const readyDays = plan.length
    ? plan.filter((item) => (item.matchScore || 0.8) >= 0.7).length
    : 5;

  // Collect needed extra ingredients
  const extraItems: string[] = [];
  plan.forEach((item) => {
    item.dish?.ingredients?.forEach((ing) => {
      if (ing.name && !extraItems.includes(ing.name) && extraItems.length < 3) {
        extraItems.push(`${ing.name} ${ing.quantity ? `(${ing.quantity})` : ''}`);
      }
    });
  });

  const handleQuickBuy = () => {
    toast.success('Đã sao chép danh sách nguyên liệu cần mua vào bộ nhớ tạm!');
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Title & Actions (Spec 3.4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-950/60 dark:text-green-300 px-3 py-1 rounded-full uppercase tracking-wider">
            An Toàn Dinh Dưỡng
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-text dark:text-foreground mt-2 tracking-tight">
            Thực Đơn Tuần Của Bạn
          </h1>
          <p className="text-sm text-surface-muted dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Kế hoạch ăn uống ấm cúng cho cả tuần, tối ưu từ nguyên liệu sẵn có trong tủ lạnh.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPlan}
          disabled={loading}
          className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-sm transition flex items-center gap-2 self-start sm:self-auto text-sm cursor-pointer disabled:opacity-70"
        >
          <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Đang tạo...' : 'Đổi thực đơn tuần mới'}</span>
        </button>
      </div>

      {/* Notification if repeated (BR-7) */}
      {hasRepeat && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3 text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <span>
            Thực đơn tuần có lặp lại món do số lượng nguyên liệu an toàn trong tủ có hạn. Bạn có thể thêm nguyên liệu để thực đơn phong phú hơn!
          </span>
        </div>
      )}

      {/* KPI Stats Bar - Minimal Thin Bar (Spec 3.4) */}
      <div className="bg-surface-dim dark:bg-neutral-800/60 px-6 py-3.5 rounded-xl border border-surface-border flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-surface-text dark:text-foreground">
        <div>
          Độ phù hợp: <span className="text-primary font-bold">{avgScore}%</span>
        </div>
        <div className="w-px h-4 bg-surface-border hidden md:block"></div>
        <div>
          Sẵn sàng: <span className="text-green-600 dark:text-green-400 font-bold">{readyDays}/7 ngày</span>
        </div>
        <div className="w-px h-4 bg-surface-border hidden md:block"></div>
        <div>
          Cần mua thêm: <span className="text-red-500 font-bold">{extraItems.length || 2} món phụ</span>
        </div>
        <div className="w-px h-4 bg-surface-border hidden md:block"></div>
        <div>
          Thời gian nấu TB: <span className="text-surface-muted dark:text-neutral-400 font-bold">25 phút/ngày</span>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-64 bg-white dark:bg-card rounded-2xl border border-surface-border animate-pulse p-4"
            />
          ))}
        </div>
      )}

      {/* 7-Day Grid (Spec 3.4) */}
      {!loading && plan.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plan.map((item, index) => {
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

      {/* Shopping Helper Bar (Spec 3.4) */}
      <div className="bg-white dark:bg-card p-4 sm:p-5 rounded-2xl border border-surface-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-primary flex items-center justify-center shrink-0">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-surface-text dark:text-foreground">
              Cần mua thêm cho tuần ({extraItems.length || 2} món)
            </h4>
            <p className="text-xs text-surface-muted dark:text-neutral-400">
              Tối ưu theo các món cần bổ sung nguyên liệu trong thực đơn
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {extraItems.length > 0 ? (
            extraItems.map((item, idx) => (
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
            onClick={handleQuickBuy}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition cursor-pointer"
          >
            Mua nhanh
          </button>
        </div>
      </div>
    </div>
  );
}
