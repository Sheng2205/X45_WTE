import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { AuthLayout } from '@/modules/auth/components/AuthLayout';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { RegisterPage } from '@/modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage';
import { LogoutPage } from '@/modules/auth/pages/LogoutPage';
import { HomePage } from '@/modules/home/pages/HomePage';
import { ProfilePage } from '@/modules/profile/pages/ProfilePage';
import { FridgePage } from '@/modules/match/pages/FridgePage';
import { SearchResultsPage } from '@/modules/match/pages/SearchResultsPage';
import { QuickPickPage } from '@/modules/match/pages/QuickPickPage';
import { WeeklyPlanPage } from '@/modules/match/pages/WeeklyPlanPage';
import { DishDetailPage } from '@/modules/match/pages/DishDetailPage';
import { FavoritesPage } from '@/modules/favorites/pages/FavoritesPage';
import { IngredientsPage } from '@/modules/admin/pages/IngredientsPage';
import { DishesPage } from '@/modules/admin/pages/DishesPage';
import { DishFormPage } from '@/modules/admin/pages/DishFormPage';

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="/logout" element={<LogoutPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Initial Introduction Page */}
        <Route path="/" element={<HomePage />} />
        <Route path="/gioi-thieu" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        {/* Core Fridge, Match, and Search Routes */}
        <Route path="/kham-pha" element={<FridgePage />} />
        <Route path="/match" element={<FridgePage />} />
        <Route path="/tu-lanh" element={<FridgePage />} />
        <Route path="/ket-qua" element={<SearchResultsPage />} />
        <Route path="/quick-pick" element={<QuickPickPage />} />
        <Route path="/thuc-don-tuan" element={<WeeklyPlanPage />} />
        <Route path="/weekly-plan" element={<WeeklyPlanPage />} />
        <Route path="/yeu-thich" element={<FavoritesPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />

        {/* Detail and Profile */}
        <Route path="/dishes/:id" element={<DishDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/me" element={<Navigate to="/profile" replace />} />

        {/* Kitchen Management (Admin) */}
        <Route path="/admin/ingredients" element={<IngredientsPage />} />
        <Route path="/admin/dishes" element={<DishesPage />} />
        <Route path="/admin/dishes/new" element={<DishFormPage />} />
        <Route path="/admin/dishes/:id/edit" element={<DishFormPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
