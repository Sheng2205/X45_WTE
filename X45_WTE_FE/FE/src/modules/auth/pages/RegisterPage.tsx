import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { OtpInput } from '@/shared/components/ui/otp-input';

const registerSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập địa chỉ email').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type FormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
  });
  const navigate = useNavigate();

  const onRegisterSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await authApi.register({ email: values.email, password: values.password });
      setEmail(values.email);
      setStep('verify');
      toast.success('Mã OTP đã được gửi đến email của bạn.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  });

  const onVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error('Vui lòng nhập địa chỉ email cần xác thực');
      return;
    }
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      await authApi.verifyRegisterOtp(targetEmail, otp);
      toast.success('Tài khoản đã xác thực! Bạn có thể đăng nhập ngay.');
      navigate('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Mã OTP không hợp lệ hoặc đã hết hạn'));
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-1.5 text-center">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Xác Nhận OTP</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Nhập mã 6 chữ số đã gửi đến <span className="font-semibold text-foreground">{email || 'email của bạn'}</span>
          </p>
        </div>
        <form className="space-y-5" onSubmit={onVerifySubmit}>
          {!email && (
            <div className="space-y-2 text-left">
              <Label htmlFor="verify-email" className="text-xs font-semibold uppercase text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="verify-email"
                  type="email"
                  className="pl-9 rounded-xl border-border/80 text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          <OtpInput value={otp} onChange={setOtp} />
          <Button className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90 py-5 font-semibold text-sm shadow-md shadow-orange-600/20" type="submit" disabled={otp.length !== 6 || loading || !email.trim()}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Xác Nhận OTP
          </Button>
          <button
            type="button"
            onClick={() => { setStep('register'); setOtp(''); }}
            className="block w-full text-center text-xs text-muted-foreground transition hover:text-foreground"
          >
            Quay lại đăng ký
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">Tạo Tài Khoản Mới</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Đăng ký để bắt đầu khám phá công thức nấu ăn.</p>
      </div>
      <form className="space-y-4" onSubmit={onRegisterSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase text-muted-foreground">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" className="pl-9 rounded-xl border-border/80 text-sm" placeholder="name@example.com" {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase text-muted-foreground">Mật khẩu</Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" className="pl-9 rounded-xl border-border/80 text-sm" type="password" placeholder="Tối thiểu 6 ký tự" {...register('password')} />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90 py-5 font-semibold text-sm shadow-md shadow-orange-600/20" type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Đăng Ký & Gửi Mã OTP
        </Button>

        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={() => {
              const currentEmail = getValues('email');
              if (currentEmail) {
                setEmail(currentEmail);
              }
              setStep('verify');
            }}
            className="font-semibold text-primary hover:underline"
          >
            Đã có mã OTP? Xác nhận ngay
          </button>
          <p className="text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};
