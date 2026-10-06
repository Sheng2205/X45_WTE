import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';

const navItems = [
  { to: '/login', label: 'Đăng Nhập' },
  { to: '/register', label: 'Đăng Ký' },
  { to: '/forgot-password', label: 'Quên Mật Khẩu' }
];

export const AuthLayout = () => {
  const location = useLocation();

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-4 sm:p-8 selection:bg-primary/20 selection:text-primary">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <section className="grid w-full gap-8 md:grid-cols-12 items-center">
        {/* Left Side: Welcoming Kitchen Illustration & Branding */}
        <div className="relative hidden rounded-3xl border border-border/80 overflow-hidden md:flex md:flex-col md:justify-between md:col-span-5 h-[520px] shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
            alt="Món ăn gia đình hấp dẫn"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          
          <div className="relative p-10 flex flex-col justify-between h-full z-10">
            <div className="space-y-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25">
                <span className="font-serif font-bold text-lg tracking-tighter">W</span>
              </div>

              <div className="space-y-2">
                <span className="rounded-full bg-orange-100/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-200">
                  Bếp Nhà WhatToEat
                </span>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-white leading-snug">
                  Nấu ngon mỗi ngày từ tủ lạnh của bạn
                </h1>
                <p className="text-xs text-white/80 leading-relaxed pt-1">
                  Không còn nỗi lo thừa đồ ăn hay đau đầu nghĩ "hôm nay ăn gì". Cùng vào bếp nấu những bữa cơm ấm cúng và an toàn cho sức khỏe.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs text-white/90">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Tìm món theo nguyên liệu có sẵn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Tự động loại trừ chất gây dị ứng</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Lên thực đơn 7 ngày không lặp món</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-white/60 border-t border-white/20 pt-4">
              WhatToEat • Người bạn đồng hành trong căn bếp
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Container */}
        <div className="space-y-6 md:col-span-7 max-w-md mx-auto w-full">
          {/* Mobile brand mark */}
          <div className="flex md:hidden items-center justify-center gap-2.5 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25">
              <span className="font-serif font-bold text-lg tracking-tighter">W</span>
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                WhatToEat
              </span>
              <span className="ml-2 rounded-full bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:text-orange-300">
                Bếp Nhà
              </span>
            </div>
          </div>

          <div className="flex justify-center md:justify-start">
            <nav className="inline-flex rounded-full border border-border/80 bg-muted/40 p-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-all',
                    location.pathname === item.to && 'bg-card text-foreground font-semibold shadow-xs'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm">
            <Outlet />
          </div>
        </div>
      </section>
    </main>
  );
};
