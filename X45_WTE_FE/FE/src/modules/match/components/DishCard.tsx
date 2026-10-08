import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Heart } from 'lucide-react';
import type { Dish } from '@/modules/match/api/match.api';
import { getDishImageUrl } from '@/shared/lib/dishImages';

export interface DishCardProps {
  dish: Dish;
  matchScore?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (dishId: string) => void;
  onSelect?: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  matchScore = 0.85,
  isFavorite = false,
  onToggleFavorite,
  onSelect,
}) => {
  const navigate = useNavigate();
  const percentage = Math.round(
    (matchScore || 0) * ((matchScore || 0) <= 1 ? 100 : 1)
  );

  const imageUrl =
    dish.imageUrl ||
    getDishImageUrl(dish.name, dish.mealType) ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(dish);
    } else {
      navigate(`/dishes/${dish._id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-card dark:bg-card rounded-2xl border border-surface-border shadow-card overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 flex flex-col group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-44 overflow-hidden bg-surface-dim">
        <img
          src={imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Match Score Badge */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold text-green-700 dark:text-green-400">
            {percentage}% Phù hợp
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(dish._id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/90 dark:bg-neutral-800/90 text-surface-muted hover:text-red-500'
          }`}
          title={isFavorite ? 'Bỏ lưu' : 'Lưu yêu thích'}
          aria-label={isFavorite ? 'Bỏ lưu' : 'Lưu yêu thích'}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-surface-muted mb-1.5">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {dish.cookTime || 20}p
            </span>
            <span>•</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              Đủ nguyên liệu
            </span>
          </div>

          <h3 className="font-bold text-base text-surface-text dark:text-foreground group-hover:text-primary transition line-clamp-1">
            {dish.name}
          </h3>

          <p className="text-xs text-surface-muted mt-1 line-clamp-2 leading-relaxed">
            {dish.description ||
              'Món ăn gia đình thơm ngon, dễ chế biến từ nguyên liệu sẵn có.'}
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="mt-4 w-full py-2 bg-surface-dim hover:bg-primary-light text-surface-text hover:text-primary dark:bg-neutral-800 dark:hover:bg-primary/20 dark:text-foreground text-xs font-bold rounded-xl transition"
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};
