import { useRef, useState } from 'react';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { profileApi } from '@/modules/profile/api/profile.api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userInitials?: string;
  onUploadSuccess: (newUrl: string) => void;
}

export const AvatarUpload = ({ currentAvatarUrl, userInitials = '??', onUploadSuccess }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatarUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận tệp hình ảnh.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB.');
      return;
    }

    setUploading(true);
    try {
      const res = await profileApi.uploadAvatar(file);
      const newUrl = (res.data as { avatarUrl: string }).avatarUrl;
      setPreviewUrl(newUrl);
      onUploadSuccess(newUrl);
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể tải ảnh đại diện lên.'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-24 ring-2 ring-border transition group-hover:ring-primary">
          <AvatarImage src={previewUrl} alt="Ảnh đại diện" />
          <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
        </Avatar>

        {/* Overlay */}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
          {uploading
            ? <Loader2 className="size-6 animate-spin text-white" />
            : <Camera className="size-6 text-white" />
          }
        </span>

        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <Loader2 className="size-6 animate-spin text-white" />
          </span>
        )}
      </button>

      <p className="text-xs text-muted-foreground">Nhấn để tải ảnh lên (tối đa 5MB)</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
