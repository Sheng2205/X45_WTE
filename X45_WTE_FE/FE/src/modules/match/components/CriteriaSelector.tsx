interface CriteriaSelectorProps {
  mealType: string;
  onMealTypeChange: (v: string) => void;
  dietTags: string[];
  onDietTagsChange: (v: string[]) => void;
  allergens: string[];
  onAllergensChange: (v: string[]) => void;
}

const MEAL_TYPES = [
  { value: '', label: 'Tất cả bữa' },
  { value: 'an_sang', label: 'Bữa sáng' },
  { value: 'an_trua', label: 'Bữa trưa' },
  { value: 'an_toi', label: 'Bữa tối' },
  { value: 'an_vat', label: 'Ăn vặt' },
  { value: 'do_uong', label: 'Đồ uống' },
  { value: 'mon_nhau', label: 'Món nhậu' },
];

const DIET_TAGS = [
  { value: 'chay', label: 'Ăn chay' },
  { value: 'man', label: 'Món mặn' },
  { value: 'keto', label: 'Keto' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'eat_clean', label: 'Eat Clean' },
];

const ALLERGENS = [
  { value: 'dau_phong', label: 'Đậu phộng' },
  { value: 'hai_san', label: 'Hải sản' },
  { value: 'trung', label: 'Trứng' },
  { value: 'sua', label: 'Sữa' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'dau_nanh', label: 'Đậu nành' },
];

export function CriteriaSelector({
  mealType,
  onMealTypeChange,
  dietTags,
  onDietTagsChange,
  allergens,
  onAllergensChange,
}: CriteriaSelectorProps) {
  const toggleDiet = (val: string) => {
    onDietTagsChange(
      dietTags.includes(val) ? dietTags.filter((i) => i !== val) : [...dietTags, val]
    );
  };

  const toggleAllergen = (val: string) => {
    onAllergensChange(
      allergens.includes(val) ? allergens.filter((i) => i !== val) : [...allergens, val]
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Meal Type Selection */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase tracking-wider text-foreground/80">
            Thời điểm bữa ăn
          </label>
          {mealType && (
            <button
              type="button"
              onClick={() => onMealTypeChange('')}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Đặt lại
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((type) => {
            const isSelected = mealType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onMealTypeChange(type.value)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/50 text-foreground hover:bg-muted border border-border/80'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Diet Tags Selection */}
      <div className="space-y-2.5">
        <label className="text-sm font-bold uppercase tracking-wider text-foreground/80">
          Chế độ ăn ưu tiên
        </label>
        <div className="flex flex-wrap gap-2">
          {DIET_TAGS.map((tag) => {
            const isSelected = dietTags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleDiet(tag.value)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'bg-muted/50 text-foreground hover:bg-muted border border-border/80'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Allergens Selection (Hard Exclusion) */}
      <div className="space-y-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase text-destructive tracking-wide">
            Tránh dị ứng (Loại trừ bắt buộc)
          </label>
          {allergens.length > 0 && (
            <button
              type="button"
              onClick={() => onAllergensChange([])}
              className="text-xs text-destructive hover:underline font-semibold"
            >
              Bỏ chọn
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-snug">
          Món có thành phần chứa chất dị ứng sẽ không xuất hiện trong gợi ý.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {ALLERGENS.map((allergen) => {
            const isSelected = allergens.includes(allergen.value);
            return (
              <button
                key={allergen.value}
                type="button"
                onClick={() => toggleAllergen(allergen.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-destructive text-destructive-foreground font-semibold shadow-xs'
                    : 'bg-background text-foreground hover:bg-destructive/10 border border-destructive/30'
                }`}
              >
                {allergen.label} {isSelected && '✕'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
