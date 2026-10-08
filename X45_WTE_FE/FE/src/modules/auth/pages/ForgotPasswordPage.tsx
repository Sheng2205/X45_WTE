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

const requestSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập địa chỉ email').email('Email không đúng định dạng'),
});

type RequestValues = z.infer<typeof requestSchema>;

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
  });

  const onRequestOtp = requestForm.handleSubmit(async (values) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values.email);
      setEmail(values.email);
      setStep('reset');
      toast.success('Mã OTP 6 số đã được gửi đến email của bạn.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.'));
    } finally {
      setLoading(false);
    }
  });

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số mã OTP');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email, otp, newPassword);
      toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      navigate('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Đặt lại mật khẩu thất bại. Mã OTP có thể không đúng hoặc đã hết hạn.'));
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-1.5 text-center sm:text-left">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
          {step === 'request' ? 'Quên Mật Khẩu' : 'Đặt Lại Mật Khẩu'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {step === 'request'
            ? 'Nhập email đã đăng ký để nhận mã OTP 6 số đặt lại mật khẩu.'
            : (
              <>
                Nhập mã OTP 6 số đã gửi đến <span className="font-semibold text-foreground">{email}</span> và mật khẩu mới.
              </>
            )}
        </p>
      </div>

      {step === 'request' ? (
        <form className="space-y-4" onSubmit={onRequestOtp}>
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
                {...requestForm.register('email')}
              />
            </div>
            {requestForm.formState.errors.email && (
              <p className="text-xs text-destructive">{requestForm.formState.errors.email.message}</p>
            )}
          </div>

          <Button
            className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90 py-5 font-semibold text-sm shadow-md shadow-orange-600/20"
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Gửi Mã OTP
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Nhớ mật khẩu rồi?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </p>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={onResetPassword}>
          <div className="space-y-2">
            <Label className="block text-center text-xs font-semibold uppercase text-muted-foreground">
              Mã OTP (6 chữ số)
            </Label>
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-semibold uppercase text-muted-foreground">
              Mật Khẩu Mới
            </Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="newPassword"
                className="pl-9 rounded-xl border-border/80 text-sm"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90 py-5 font-semibold text-sm shadow-md shadow-orange-600/20"
            type="submit"
            disabled={otp.length !== 6 || newPassword.length < 6 || loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Đặt Lại Mật Khẩu
          </Button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setOtp('');
                setNewPassword('');
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Gửi lại mã OTP
            </button>
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
