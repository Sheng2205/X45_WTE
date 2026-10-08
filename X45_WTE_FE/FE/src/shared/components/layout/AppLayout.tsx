import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '@/modules/auth/api/auth.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { Navbar } from './Navbar';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

export const AppLayout = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
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

  return (
    <div className="min-h-screen bg-surface dark:bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1-Line Header from Spec 3.1 */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Page Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* WTE Culinary Footer */}
      <footer className="mt-auto border-t border-surface-border bg-white/70 dark:bg-neutral-900/60 py-6 sm:py-8 text-center text-xs sm:text-sm text-surface-muted dark:text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-surface-text dark:text-foreground text-sm">
              WhatToEat - Bếp Nhà
            </span>
            <span>• Nấu ngon mỗi ngày từ nguyên liệu sẵn có</span>
          </div>
          <p>© 2026 WhatToEat - Bếp Nhà. Tối ưu tủ lạnh, ăn ngon tròn vị gia đình.</p>
        </div>
      </footer>
    </div>
  );
};
