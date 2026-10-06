import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/admin.api';
import type { Ingredient } from '../api/admin.api';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';

export const IngredientsPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadIngredients = async (searchQuery = '') => {
    try {
      const res = await adminApi.getIngredients(searchQuery);
      setIngredients(res.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadIngredients(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await adminApi.createIngredient(newName.trim());
      toast.success('Đã thêm nguyên liệu vào danh mục!');
      setNewName('');
      loadIngredients(search);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error('Nguyên liệu này đã tồn tại trong danh mục');
      } else {
        toast.error('Lỗi khi thêm nguyên liệu');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await adminApi.updateIngredient(id, editName.trim());
      toast.success('Cập nhật nguyên liệu thành công');
      setEditingId(null);
      loadIngredients(search);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật nguyên liệu');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn nguyên liệu "${name}"?`)) return;
    try {
      await adminApi.deleteIngredient(id);
      toast.success('Đã xóa nguyên liệu');
      loadIngredients(search);
    } catch (err) {
      toast.error('Lỗi khi xóa nguyên liệu');
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
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mt-1">
            Danh Mục Nguyên Liệu Chuẩn Hóa
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-border/80 bg-muted/40 p-1">
            <Link
              to="/admin/dishes"
              className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Món Ăn
            </Link>
            <Link
              to="/admin/ingredients"
              className="rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold bg-card text-foreground shadow-xs"
            >
              Nguyên Liệu ({ingredients.length})
            </Link>
          </div>
        </div>
      </div>

      {/* Add New Ingredient Form */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm space-y-4">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
          Thêm Nguyên Liệu Mới Vào Catalog
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nhập tên nguyên liệu mới (vd: măng tây, hành hoa, thịt vịt...)"
            className="rounded-2xl border-border/80 text-sm h-11 sm:h-12 px-4 flex-1"
          />
          <Button
            type="submit"
            className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm h-11 sm:h-12 px-7"
          >
            + Thêm Vào Bếp
          </Button>
        </form>
      </div>

      {/* Search & List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm nhanh nguyên liệu trong danh sách..."
            className="rounded-2xl border-border/80 text-sm h-11 px-4 max-w-sm"
          />
          <span className="text-xs sm:text-sm text-muted-foreground font-medium">
            Hiển thị {ingredients.length} nguyên liệu
          </span>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Đang tải danh sách nguyên liệu...
            </div>
          ) : ingredients.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Không tìm thấy nguyên liệu nào phù hợp.
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {ingredients.map((ing) => (
                <li
                  key={ing._id}
                  className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                >
                  {editingId === ing._id ? (
                    <div className="flex flex-1 items-center gap-2.5 mr-4">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded-xl text-sm h-10 bg-background"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(ing._id)}
                        className="rounded-xl text-xs sm:text-sm h-10 px-4"
                      >
                        Lưu
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="rounded-xl text-xs sm:text-sm h-10 px-3"
                      >
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-primary/60" />
                      <span className="text-sm sm:text-base font-semibold text-foreground capitalize">
                        {ing.name}
                      </span>
                    </div>
                  )}

                  {editingId !== ing._id && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(ing._id);
                          setEditName(ing.name);
                        }}
                        className="rounded-full text-xs sm:text-sm h-9 px-3.5 font-medium"
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(ing._id, ing.name)}
                        className="rounded-full text-xs sm:text-sm h-9 px-3.5 text-destructive hover:bg-destructive/10 font-medium"
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
