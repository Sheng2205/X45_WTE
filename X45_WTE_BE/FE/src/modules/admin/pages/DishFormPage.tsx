import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminApi } from '../api/admin.api';
import type { Ingredient } from '../api/admin.api';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';

const MEAL_OPTIONS = [
  { value: 'an_sang', label: 'Bữa sáng' },
  { value: 'an_trua', label: 'Bữa trưa' },
  { value: 'an_toi', label: 'Bữa tối' },
  { value: 'an_vat', label: 'Ăn vặt' },
  { value: 'do_uong', label: 'Đồ uống' },
  { value: 'mon_nhau', label: 'Món nhậu' },
];

const DIET_TAGS_OPTIONS = [
  { value: 'chay', label: 'Ăn chay' },
  { value: 'man', label: 'Món mặn' },
  { value: 'keto', label: 'Keto' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'eat_clean', label: 'Eat Clean' },
];

const ALLERGENS_OPTIONS = [
  { value: 'dau_phong', label: 'Đậu phộng' },
  { value: 'hai_san', label: 'Hải sản' },
  { value: 'trung', label: 'Trứng' },
  { value: 'sua', label: 'Sữa' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'dau_nanh', label: 'Đậu nành' },
];

export const DishFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('an_trua');
  const [dietTags, setDietTags] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);

  const [ingredients, setIngredients] = useState<
    { ingredientId: string; name: string; quantity: string }[]
  >([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientResults, setIngredientResults] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      adminApi.getDish(id)
        .then((res) => {
          const dish = res.data;
          setName(dish.name);
          setDescription(dish.description || '');
          setMealType(dish.mealType || 'an_trua');
          setDietTags(dish.dietTags || []);
          setAllergens(dish.allergens || []);
          setIngredients(
            dish.ingredients.map((i) => ({
              ingredientId: i.ingredientId,
              name: i.name,
              quantity: i.quantity || '',
            }))
          );
        })
        .catch(() => toast.error('Lỗi khi tải thông tin món ăn'));
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (!ingredientSearch.trim()) {
      setIngredientResults([]);
      return;
    }
    const timer = setTimeout(() => {
      adminApi.getIngredients(ingredientSearch)
        .then((res) => setIngredientResults(res.data))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [ingredientSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Vui lòng nhập tên món ăn');
    if (!mealType) return toast.error('Vui lòng chọn loại bữa ăn');
    if (ingredients.length === 0) return toast.error('Món ăn phải có ít nhất 1 nguyên liệu');

    const payload = {
      name,
      description,
      mealType,
      dietTags,
      allergens,
      ingredients,
    };

    try {
      if (isEdit && id) {
        await adminApi.updateDish(id, payload);
        toast.success('Cập nhật món ăn thành công!');
      } else {
        await adminApi.createDish(payload);
        toast.success('Thêm món ăn mới thành công!');
      }
      navigate('/admin/dishes');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi lưu món ăn');
    }
  };

  const toggleItem = (val: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(val)) {
      setList(list.filter((t) => t !== val));
    } else {
      setList([...list, val]);
    }
  };

  const addIngredient = (ing: Ingredient) => {
    if (ingredients.some((i) => i.ingredientId === ing._id)) {
      return toast.info('Nguyên liệu này đã có trong danh sách');
    }
    setIngredients([...ingredients, { ingredientId: ing._id, name: ing.name, quantity: '' }]);
    setIngredientSearch('');
    setIngredientResults([]);
  };

  const updateQuantity = (index: number, quantity: string) => {
    const next = [...ingredients];
    next[index].quantity = quantity;
    setIngredients(next);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/dishes')}
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-1.5 font-medium transition-colors"
          >
            ← Quay lại danh mục món
          </button>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground">
            {isEdit ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Điền đầy đủ thông tin để thuật toán tính Match Score chính xác
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">
              Tên món ăn <span className="text-destructive">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Canh chua cá lóc, Thịt kho tàu..."
              className="h-11 sm:h-12 rounded-xl border-border/80 text-sm font-medium px-4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">
              Mô tả ngắn món ăn
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hương vị, gợi ý ăn kèm hoặc cảm nhận về món..."
              className="rounded-xl border-border/80 text-sm min-h-[90px] p-3.5"
            />
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">
              Loại bữa ăn chính <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {MEAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMealType(opt.value)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                    mealType === opt.value
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-muted/50 text-foreground hover:bg-muted border border-border/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Dietary & Allergens */}
        <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 space-y-6">
          <div className="space-y-2.5">
            <Label className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">
              Chế độ ăn phù hợp (Diet Tags)
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TAGS_OPTIONS.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => toggleItem(tag.value, dietTags, setDietTags)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                    dietTags.includes(tag.value)
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-muted/50 text-foreground hover:bg-muted border border-border/60'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-border/60">
            <Label className="text-xs sm:text-sm font-semibold uppercase text-destructive">
              Có chứa chất gây dị ứng (Allergens)
            </Label>
            <p className="text-xs text-muted-foreground">
              Nếu người dùng chọn tránh dị ứng chất này, món này sẽ bị loại bỏ khỏi kết quả.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS_OPTIONS.map((allergen) => (
                <button
                  key={allergen.value}
                  type="button"
                  onClick={() => toggleItem(allergen.value, allergens, setAllergens)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                    allergens.includes(allergen.value)
                      ? 'bg-destructive text-destructive-foreground font-semibold shadow-xs'
                      : 'bg-background text-foreground hover:bg-destructive/10 border border-destructive/30'
                  }`}
                >
                  {allergen.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Dynamic Ingredients */}
        <Card className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <Label className="text-xs sm:text-sm font-semibold uppercase text-muted-foreground">
                Thành phần nguyên liệu ({ingredients.length}) <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Tìm kiếm nguyên liệu từ danh mục chuẩn hóa để thêm vào món
              </p>
            </div>
            <Link
              to="/admin/ingredients"
              className="text-xs text-primary hover:underline font-semibold"
            >
              + Tạo nguyên liệu mới nếu thiếu
            </Link>
          </div>

          {/* Autocomplete Input */}
          <div className="relative">
            <Input
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              placeholder="Gõ để tìm nguyên liệu (vd: thịt heo, cá, cà chua)..."
              className="h-11 sm:h-12 rounded-xl border-border/80 text-sm px-4"
            />
            {ingredientResults.length > 0 && (
              <div className="absolute z-20 w-full bg-card border border-border rounded-xl shadow-xl mt-1.5 max-h-56 overflow-y-auto p-1.5 divide-y divide-border/40">
                {ingredientResults.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => addIngredient(item)}
                    className="w-full text-left p-3 rounded-lg text-sm hover:bg-primary/10 hover:text-primary flex items-center justify-between"
                  >
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-primary font-bold">+ Chọn</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Ingredients List */}
          <div className="space-y-2 pt-2">
            {ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground/70 italic text-center py-5 border border-dashed rounded-xl">
                Chưa có nguyên liệu nào. Hãy tìm và chọn từ ô trên.
              </p>
            ) : (
              ingredients.map((item, idx) => (
                <div
                  key={item.ingredientId || idx}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3"
                >
                  <span className="text-sm font-semibold text-foreground flex-1 pl-1">
                    {item.name}
                  </span>
                  <Input
                    value={item.quantity}
                    onChange={(e) => updateQuantity(idx, e.target.value)}
                    placeholder="Định lượng (vd: 300g, 2 quả...)"
                    className="w-32 sm:w-48 h-9 rounded-lg text-sm bg-background px-3"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="text-sm text-muted-foreground hover:text-destructive px-2 py-1 font-bold"
                    title="Xóa"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/dishes')}
            className="rounded-full h-11 px-6 text-sm"
          >
            Hủy Bỏ
          </Button>
          <Button
            type="submit"
            className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-8 h-11 shadow-md shadow-orange-600/20"
          >
            {isEdit ? 'Lưu Thay Đổi' : 'Thêm Món Vào Bếp'}
          </Button>
        </div>
      </form>
    </div>
  );
};
