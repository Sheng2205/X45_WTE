import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/modules/auth/api/auth.api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

// Danh mục nguyên liệu thường có trong tủ lạnh gia đình Việt (không dùng emoji rườm rà)
const popularPantryItems = [
  'Trứng gà',
  'Thịt ba chỉ',
  'Cà chua',
  'Đậu phụ',
  'Hành lá',
  'Tôm tươi',
  'Thịt bò',
  'Nấm hương',
  'Khoai tây',
  'Bông cải xanh',
  'Cà rốt',
  'Cá hồi / Cá basa',
];

export const HomePage = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [quickSelected, setQuickSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    authApi.getMe()
      .then((res) => setUser(res.data as CurrentUser))
      .catch(() => {});
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Đầu Bếp Gia Đình';

  const togglePantryItem = (name: string) => {
    setQuickSelected((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleStartMatching = () => {
    navigate('/kham-pha', { state: { presetIngredientNames: quickSelected } });
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Editorial Culinary Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/90 dark:border-orange-900/60 dark:bg-orange-950/40 px-4 py-1.5 text-xs sm:text-sm font-bold text-orange-800 dark:text-orange-300">
              Chào mừng {displayName} đến với gian bếp
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              Tủ lạnh hôm nay có gì, <br />
              <span className="text-primary italic">nấu ngay món ngon đó!</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Đừng để đồ ăn trong tủ bị bỏ quên. Chọn các nguyên liệu bạn đang có sẵn, WhatToEat sẽ tự động tính toán mức độ phù hợp và gợi ý công thức hoàn hảo nhất cho bữa cơm hôm nay.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button
                asChild
                className="rounded-full bg-primary hover:bg-primary/90 text-white px-7 py-3 text-sm font-bold shadow-md shadow-orange-600/20 h-12"
              >
                <Link to="/kham-pha">Bắt đầu tìm món →</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full px-7 py-3 text-sm font-bold border-border/80 hover:bg-muted h-12"
              >
                <Link to="/quick-pick">Quay món ngẫu nhiên</Link>
              </Button>
            </div>
          </div>

          {/* Real Culinary Hero Photography - Prominent & Appetizing */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] w-full min-h-[280px] sm:min-h-[340px] rounded-3xl overflow-hidden shadow-xl border border-border/60">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                alt="Bữa cơm gia đình ấm cúng"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <p className="font-bold text-base sm:text-lg">Bữa Cơm Nhà Chuẩn Vị</p>
                <p className="text-white/85 text-xs sm:text-sm">Tối ưu 100% nguyên liệu sẵn có</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Pantry Selector */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Chọn nhanh từ tủ lạnh
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Nguyên Liệu Phổ Biến Trong Nhà
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
              Chạm vào nguyên liệu bạn đang có sẵn để chuyển nhanh sang bàn tính công thức:
            </p>
          </div>

          {quickSelected.length > 0 && (
            <Button
              onClick={handleStartMatching}
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-3 text-sm font-bold shadow-md shadow-orange-600/20 transition-all hover:scale-[1.02] h-11 shrink-0"
            >
              Tìm món với ({quickSelected.length}) đồ này →
            </Button>
          )}
        </div>

        {/* Clean Typographic Ingredient Chips */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {popularPantryItems.map((name) => {
            const isSelected = quickSelected.includes(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => togglePantryItem(name)}
                className={`group flex items-center gap-2.5 rounded-full border px-4.5 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-white font-bold shadow-xs'
                    : 'border-border/80 bg-muted/40 text-foreground hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <span>{name}</span>
                <span className={`text-xs ${isSelected ? 'text-white font-bold' : 'text-muted-foreground group-hover:text-primary'}`}>
                  {isSelected ? '✓' : '+'}
                </span>
              </button>
            );
          })}
        </div>

        {quickSelected.length === 0 && (
          <p className="text-xs text-muted-foreground italic pt-1">
            * Mẹo: Chọn từ 2-3 nguyên liệu để nhận được gợi ý món ăn có điểm tương thích cao nhất.
          </p>
        )}
      </section>

      {/* 3 Core Experience Paths with Real Photography Banners */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Giải pháp chuyên sâu
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Lựa Chọn Cách Tìm Món Cho Bạn
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Linh hoạt tìm kiếm theo tỷ lệ nguyên liệu, quay ngẫu nhiên hoặc lập lịch trình cho cả tuần
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Match */}
          <Link to="/kham-pha" className="group block focus:outline-none">
            <Card className="h-full overflow-hidden rounded-3xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-orange-500/5">
              <div className="aspect-[16/10] w-full overflow-hidden bg-muted min-h-[220px]">
                <img
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80"
                  alt="Nguyên liệu tươi ngon"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-6 space-y-3.5">
                <span className="rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 px-3 py-1 text-xs font-bold">
                  Thuật Toán Điểm Khớp
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Tìm Món Chuẩn Xác
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    Tính toán điểm khớp (Match Score), lọc sạch chất gây dị ứng và cân nhắc chế độ ăn chay, mặn, eat clean.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-sm font-bold text-primary">
                  Bắt đầu tìm kiếm <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 2: Quick Pick */}
          <Link to="/quick-pick" className="group block focus:outline-none">
            <Card className="h-full overflow-hidden rounded-3xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-orange-500/5">
              <div className="aspect-[16/10] w-full overflow-hidden bg-muted min-h-[220px]">
                <img
                  src="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80"
                  alt="Hôm nay ăn gì"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-6 space-y-3.5">
                <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold">
                  Vòng Quay Nấu Nướng
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Hôm Nay Ăn Gì? (Chọn Nhanh)
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    Phân vân không biết chọn gì? Bếp trưởng sẽ quay ngẫu nhiên có trọng số món phù hợp nhất cho bạn.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-sm font-bold text-primary">
                  Quay món ngẫu nhiên <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Card 3: Weekly Plan */}
          <Link to="/thuc-don-tuan" className="group block focus:outline-none">
            <Card className="h-full overflow-hidden rounded-3xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl hover:shadow-orange-500/5">
              <div className="aspect-[16/10] w-full overflow-hidden bg-muted min-h-[220px]">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80"
                  alt="Thực đơn cả tuần"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-6 space-y-3.5">
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold">
                  Kế Hoạch 7 Ngày
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Thực Đơn Cả Tuần
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                    Lên sẵn kế hoạch 7 ngày, tối ưu thực đơn không bị lặp món, giúp bạn an tâm đi chợ một lần cho cả tuần.
                  </p>
                </div>
                <div className="pt-2 flex items-center text-sm font-bold text-primary">
                  Lập kế hoạch tuần <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Quick shortcut to Favorites */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl overflow-hidden shrink-0 border border-border/60">
            <img
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=200&q=80"
              alt="Món yêu thích"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground">Sổ Tay Món Yêu Thích</h4>
            <p className="text-sm text-muted-foreground">
              Lưu giữ những món ăn ngon bạn muốn nấu lại nhiều lần cho gia đình.
            </p>
          </div>
        </div>
        <Button variant="outline" asChild className="rounded-full text-sm font-semibold border-border/80 hover:bg-muted shrink-0 h-11 px-6">
          <Link to="/yeu-thich">Xem danh sách đã lưu →</Link>
        </Button>
      </section>
    </div>
  );
};
