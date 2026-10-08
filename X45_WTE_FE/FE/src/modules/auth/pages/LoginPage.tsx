import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { tokenStore } from '../store/token.store';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập địa chỉ email').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type FormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
  });
  const navigate = useNavigate();

  const onLoginSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email: values.email, password: values.password });
      const token = response.data?.token as string | undefined;
      if (token) {
        tokenStore.set(token);
        toast.success('Đăng nhập thành công!');
        navigate('/');
        return;
      }
      toast.error('Không nhận được mã xác thực. Vui lòng thử lại.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.'));
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Chào Mừng Trở Lại</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Đăng nhập để vào bếp nấu ăn ngon mỗi ngày.</p>
      </div>

      <form className="space-y-4" onSubmit={onLoginSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase text-muted-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              className="pl-9 rounded-xl border-border/80 text-sm"
              placeholder="name@example.com"
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold uppercase text-muted-foreground">
              Mật khẩu
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline hover:text-primary/90"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              className="pl-9 rounded-xl border-border/80 text-sm"
              type="password"
              placeholder="Nhập mật khẩu của bạn"
              {...register('password')}
            />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button
          className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90 py-5 font-semibold text-sm shadow-md shadow-orange-600/20"
          type="submit"
          disabled={loading}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Đăng Nhập
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-1">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
};
