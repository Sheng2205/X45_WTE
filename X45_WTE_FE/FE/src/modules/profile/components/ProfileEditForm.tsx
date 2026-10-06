import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { profileApi } from '@/modules/profile/api/profile.api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

// Accepts digits with optional leading + and common separators (spaces, dashes, parentheses).
const phoneRegex = /^\+?[\d\s().-]+$/;

// Empty optional fields come through as '' from the inputs; treat '' as "not provided"
// so the value is stripped before hitting the backend (which rejects empty strings).
const optionalTrimmed = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === '' ? undefined : v));

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
    .max(100, 'Tối đa 100 ký tự'),
  bio: optionalTrimmed.pipe(z.string().max(200, 'Tối đa 200 ký tự').optional()),
  phone: optionalTrimmed.pipe(
    z
      .string()
      .min(7, 'Số điện thoại phải có ít nhất 7 ký tự')
      .max(20, 'Tối đa 20 ký tự')
      .regex(phoneRegex, 'Vui lòng nhập số điện thoại hợp lệ')
      .optional(),
  ),
});

type FormValues = z.input<typeof schema>;
type SubmitValues = z.output<typeof schema>;

interface ProfileEditFormProps {
  defaultValues: FormValues;
  onSuccess: () => void;
}

export const ProfileEditForm = ({ defaultValues, onSuccess }: ProfileEditFormProps) => {
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues, unknown, SubmitValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const bioValue = watch('bio') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await profileApi.updateProfile(values);
      toast.success('Cập nhật hồ sơ thành công!');
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Cập nhật hồ sơ thất bại.'));
    } finally {
      setSaving(false);
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-sm font-semibold text-foreground">Tên Hiển Thị</Label>
        <Input
          id="displayName"
          placeholder="Nhập tên bạn muốn hiển thị"
          className="rounded-xl text-sm transition-colors focus-visible:ring-primary/50"
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-xs text-destructive">{errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio" className="text-sm font-semibold text-foreground">Giới Thiệu</Label>
          <span className="text-xs text-muted-foreground">{bioValue.length}/200</span>
        </div>
        <textarea
          id="bio"
          rows={3}
          placeholder="Giới thiệu bản thân bạn (sở thích nấu nướng, phong cách ẩm thực...)"
          className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/50"
          {...register('bio')}
        />
        {errors.bio && (
          <p className="text-xs text-destructive">{errors.bio.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Số Điện Thoại</Label>
        <Input
          id="phone"
          placeholder="+84 xxx xxx xxxx"
          className="rounded-xl text-sm transition-colors focus-visible:ring-primary/50"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-6" disabled={saving}>
        {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
      </Button>
    </form>
  );
};
