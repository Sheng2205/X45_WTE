import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, LogOut, Heart } from 'lucide-react';
import { ThemeToggle } from '@/shared/components/ui/theme-toggle';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

export interface NavbarProps {
  user: CurrentUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Giới Thiệu', path: '/', alias: ['/gioi-thieu', '/home'] },
    { name: 'Tủ Lạnh', path: '/kham-pha', alias: ['/match', '/tu-lanh'] },
    { name: 'Gợi Ý Món', path: '/ket-qua', alias: [] },
    { name: 'Chọn Nhanh', path: '/quick-pick', alias: [] },
    { name: 'Thực Đơn Tuần', path: '/thuc-don-tuan', alias: ['/weekly-plan'] },
  ];

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Đầu Bếp';
  const initial = displayName.charAt(0).toUpperCase();

  const isItemActive = (item: typeof navItems[0]) => {
    if (location.pathname === item.path) return true;
    if (item.alias.includes(location.pathname)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo: WhatToEat - Bếp Nhà */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <UtensilsCrossed size={22} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-surface-text dark:text-foreground">
                WhatToEat
              </span>
              <span className="text-surface-muted dark:text-neutral-500 font-normal text-sm sm:text-base hidden xs:inline">
                -
              </span>
              <span className="text-[11px] sm:text-xs font-bold bg-primary-light text-primary dark:bg-orange-950/60 dark:text-orange-300 px-2.5 py-0.5 rounded-full">
                Bếp Nhà
              </span>
            </div>
            <span className="text-[11px] text-surface-muted -mt-0.5 font-medium hidden sm:inline">
              Hôm nay nấu gì từ đồ có sẵn?
            </span>
          </div>
        </Link>

        {/* Navigation Tabs - Strict 1 line, no wrapping */}
        <nav className="flex items-center gap-1 bg-surface-dim dark:bg-neutral-800/70 p-1 rounded-full overflow-x-auto no-scrollbar shrink">
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-150 whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-surface-muted hover:text-surface-text dark:text-neutral-400 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-700/50'
                }`}
              >
                {item.name}
              </NavLink>
            );
          })}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin/dishes"
              className={({ isActive }) =>
                `px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-150 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-orange-700 text-white shadow-sm'
                    : 'text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-950/50'
                }`
              }
            >
              Quản Trị
            </NavLink>
          )}
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />

          <NavLink
            to="/yeu-thich"
            className={({ isActive }) =>
              `p-2 transition rounded-full hover:bg-surface-dim dark:hover:bg-neutral-800 ${
                isActive
                  ? 'text-red-500 bg-red-50 dark:bg-red-950/40'
                  : 'text-surface-muted hover:text-primary dark:text-neutral-400'
              }`
            }
            title="Món yêu thích"
          >
            <Heart
              size={20}
              className={
                location.pathname === '/yeu-thich' || location.pathname === '/favorites'
                  ? 'fill-current text-red-500'
                  : ''
              }
            />
          </NavLink>

          <div className="flex items-center gap-2 sm:gap-2.5 pl-2 border-l border-surface-border">
            <Link
              to="/profile"
              className="flex items-center gap-2 hover:opacity-80 transition"
              title="Hồ sơ cá nhân"
            >
              <div className="w-8 h-8 rounded-full bg-primary-light dark:bg-orange-950/80 text-primary dark:text-orange-300 font-bold flex items-center justify-center text-sm shadow-2xs">
                {initial}
              </div>
              <span className="text-sm font-medium text-surface-text dark:text-foreground hidden lg:inline max-w-[100px] truncate">
                {displayName}
              </span>
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-surface-muted hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
