import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../api/auth.api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

const requestSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập địa chỉ email').email('Email không đúng định dạng'),
});

const resetSchema = z.object({
  email: z.string().optional(),
  token: z.string().min(1, 'Vui lòng nhập mã token'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');

  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
  });
  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  const onRequestToken = requestForm.handleSubmit(async (values) => {
    try {
      await authApi.forgotPassword(values.email);
      setEmail(values.email);
      setStep('reset');
      toast.success('Mã đặt lại đã được gửi đến email của bạn.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể gửi mã. Vui lòng kiểm tra lại email.'));
    }
  });

  const onResetPassword = resetForm.handleSubmit(async (values) => {
    try {
      await authApi.resetPassword(email || values.email || '', values.token, values.newPassword);
      toast.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      setStep('request');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Đặt lại mật khẩu thất bại. Mã có thể đã hết hạn.'));
    }
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
          {step === 'request' ? 'Quên Mật Khẩu' : 'Đặt Lại Mật Khẩu'}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {step === 'request'
            ? 'Nhập email để nhận mã đặt lại mật khẩu.'
            : `Nhập mã đã gửi đến ${email} và mật khẩu mới.`}
        </p>
      </div>
      
      {step === 'request' ? (
        <form className="space-y-4" onSubmit={onRequestToken}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase text-muted-foreground">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" className="pl-9 rounded-xl border-border/80 text-sm" placeholder="name@example.com" {...requestForm.register('email')} />
            </div>
            {requestForm.formState.errors.email && (
              <p className="text-xs text-destructive">{requestForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90 py-5 font-semibold text-sm shadow-md shadow-orange-600/20" type="submit">
            Gửi Mã Đặt Lại
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={onResetPassword}>
          <div className="space-y-2">
            <Label htmlFor="token" className="text-xs font-semibold uppercase text-muted-foreground">Mã Đặt Lại</Label>
            <Input id="token" className="rounded-xl border-border/80 text-sm" placeholder="Dán mã từ email" {...resetForm.register('token')} />
            {resetForm.formState.errors.token && (
              <p className="text-xs text-destructive">{resetForm.formState.errors.token.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-semibold uppercase text-muted-foreground">Mật Khẩu Mới</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="newPassword" className="pl-9 rounded-xl border-border/80 text-sm" type="password" placeholder="Tối thiểu 6 ký tự" {...resetForm.register('newPassword')} />
            </div>
            {resetForm.formState.errors.newPassword && (
              <p className="text-xs text-destructive">{resetForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <Button className="w-full rounded-2xl bg-primary text-white hover:bg-primary/90 py-5 font-semibold text-sm shadow-md shadow-orange-600/20" type="submit">
            Đặt Lại Mật Khẩu
          </Button>
          <button
            type="button"
            onClick={() => setStep('request')}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Quay lại yêu cầu mã
          </button>
        </form>
      )}
    </div>
  );
};
