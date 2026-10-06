import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import { authApi } from '@/modules/auth/api/auth.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

const navItems = [
  { to: '/', label: 'Khám Phá' },
  { to: '/match', label: 'Tìm Theo Tủ Lạnh' },
  { to: '/quick-pick', label: 'Món Bất Ngờ' },
  { to: '/weekly-plan', label: 'Thực Đơn Tuần' },
  { to: '/favorites', label: 'Món Yêu Thích' },
];

export const AppLayout = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    authApi.getMe()
      .then((res) => setUser(res.data as CurrentUser))
      .catch(() => {
        tokenStore.clear();
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    tokenStore.clear();
    navigate('/login');
  };

  const initials = (user?.displayName || user?.email || '??').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md transition-all shadow-xs">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 transition-transform group-hover:scale-105">
              <span className="font-bold text-xl tracking-tight">W</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-2xl tracking-tight text-foreground font-serif">
                  WhatToEat
                </span>
                <span className="rounded-full bg-orange-100 dark:bg-orange-950/60 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:text-orange-300">
                  Bếp Nhà
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block font-medium">
                Hôm nay nấu gì từ đồ có sẵn?
              </p>
            </div>
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 p-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-card text-primary shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin/dishes"
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                  location.pathname.startsWith('/admin')
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-950/50'
                )}
              >
                Quản Trị Bếp
              </Link>
            )}
          </nav>

          {/* Right Action: User & Theme */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              to="/profile"
              className="flex items-center gap-2.5 rounded-full border border-border/80 bg-card/60 p-1.5 pr-4 transition-colors hover:border-primary/50 hover:bg-card"
            >
              <Avatar className="h-9 w-9 ring-1 ring-border">
                <AvatarImage src={user?.avatarUrl} alt={user?.displayName || user?.email} />
                <AvatarFallback className="bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline text-sm font-semibold text-foreground max-w-[130px] truncate">
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-full text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-4 py-2"
            >
              Thoát
            </Button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto px-4 py-2.5 border-t border-border/50 gap-2.5 no-scrollbar bg-card/30 items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link
              to="/admin/dishes"
              className="whitespace-nowrap rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 px-3.5 py-1.5 text-xs font-bold"
            >
              Quản Trị
            </Link>
          )}
        </div>
      </header>

      {/* Main Page Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Outlet />
      </main>

      {/* Warm Culinary Footer */}
      <footer className="mt-auto border-t border-border/60 bg-card/40 py-8 sm:py-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-foreground text-base">WhatToEat</span>
            <span>• Nấu ngon mỗi ngày từ nguyên liệu sẵn có</span>
          </div>
          <p>© 2026 WhatToEat. Ăn ngon, sống khỏe, không lãng phí thực phẩm.</p>
        </div>
      </footer>
    </div>
  );
};
