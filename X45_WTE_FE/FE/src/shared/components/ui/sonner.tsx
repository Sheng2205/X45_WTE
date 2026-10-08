import { Toaster as SonnerToaster } from 'sonner';

function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: 'rounded-2xl border font-sans',
      }}
    />
  );
}

export { Toaster };
