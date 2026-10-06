import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import type { ScoredDish } from '../api/match.api';
import { getDishImageUrl } from '@/shared/lib/dishImages';

interface MatchResultCardProps {
  dish: ScoredDish['dish'];
  matchScore: number;
  matchedIngredients: number;
  totalIngredients: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const MEAL_NAMES: Record<string, string> = {
  an_sang: 'Ăn sáng',
  an_trua: 'Ăn trưa',
  an_toi: 'Ăn tối',
  an_vat: 'Ăn vặt',
  do_uong: 'Đồ uống',
  mon_nhau: 'Món nhậu',
};

const DIET_NAMES: Record<string, string> = {
  chay: 'Chay',
  man: 'Mặn',
  keto: 'Keto',
  low_carb: 'Low Carb',
  eat_clean: 'Eat Clean',
};

export function MatchResultCard({
  dish,
  matchScore,
  matchedIngredients,
  totalIngredients,
  isFavorite,
  onToggleFavorite,
}: MatchResultCardProps) {
  // Normalize matchScore
  const displayScore = matchScore <= 1 ? Math.round(matchScore * 100) : Math.round(matchScore);
  const imageUrl = dish.imageUrl || getDishImageUrl(dish.name, dish.mealType);

  const getScoreTheme = (score: number) => {
    if (score >= 70) {
      return {
        badgeBg: 'bg-emerald-600 text-white',
        bar: 'bg-emerald-500',
        label: 'Khớp cao',
      };
    }
    if (score >= 40) {
      return {
        badgeBg: 'bg-amber-600 text-white',
        bar: 'bg-amber-500',
        label: 'Khá hợp',
      };
    }
    return {
      badgeBg: 'bg-orange-600 text-white',
      bar: 'bg-orange-500',
      label: 'Cần bổ sung',
    };
  };

  const theme = getScoreTheme(displayScore);

  return (
    <Link to={`/dishes/${dish._id}`} className="group block h-full focus:outline-none">
      <Card className="relative h-full flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-orange-950/5">
        {/* Dish Real Photo Banner - Enlarged and appetizing */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted min-h-[220px]">
          <img
            src={imageUrl}
            alt={dish.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Top Pill Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
            <span className="rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-neutral-800 shadow-xs">
              {MEAL_NAMES[dish.mealType] || dish.mealType}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              className={`rounded-full p-2.5 backdrop-blur-md transition-all shadow-xs flex items-center justify-center ${
                isFavorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/35 text-white hover:bg-white hover:text-rose-500'
              }`}
              title={isFavorite ? 'Bỏ lưu' : 'Lưu món ăn'}
              aria-label={isFavorite ? 'Bỏ lưu món' : 'Lưu món ăn'}
            >
              <Heart className={`size-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Score Badge floating at bottom right of image */}
          <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1.5">
            <span className={`rounded-full px-3.5 py-1 text-xs sm:text-sm font-bold shadow-sm ${theme.badgeBg}`}>
              {displayScore}% • {theme.label}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-xl sm:text-2xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {dish.name}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {dish.description || 'Món ngon đậm vị cho bữa cơm gia đình từ các nguyên liệu sẵn có.'}
            </p>
          </div>

          {/* Progress & Ingredients ratio */}
          <div className="space-y-2.5 pt-3 border-t border-border/50">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>Đã có <strong>{matchedIngredients}/{totalIngredients}</strong> nguyên liệu</span>
              <span className="font-semibold text-foreground">{displayScore}% tương thích</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${theme.bar}`}
                style={{ width: `${Math.min(displayScore, 100)}%` }}
              />
            </div>

            {/* Diet Tags (Clean pills, no icons) */}
            {dish.dietTags && dish.dietTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {dish.dietTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-xs font-semibold"
                  >
                    {DIET_NAMES[tag] || tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
