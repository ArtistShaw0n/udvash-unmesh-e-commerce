import { clsx } from "@/lib/clsx";

export type SocialProvider = "google" | "facebook";

export interface SocialLoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: SocialProvider;
}

export function SocialLoginButton({
  provider,
  className,
  type = "button",
  ...rest
}: SocialLoginButtonProps) {
  const config = {
    google: { label: "গুগল দিয়ে লগইন করুন", icon: <GoogleIcon /> },
    facebook: { label: "ফেসবুক দিয়ে লগইন করুন", icon: <FacebookIcon /> },
  }[provider];

  return (
    <button
      type={type}
      className={clsx(
        "w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-body font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors",
        className,
      )}
      {...rest}
    >
      {config.icon}
      {config.label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11 10.13 11.93v-8.44H7.08v-3.49h3.05V9.36c0-3.02 1.79-4.69 4.54-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.88v2.26h3.34l-.53 3.49h-2.81V24C19.61 23.07 24 18.09 24 12.07z"/>
      <path fill="#fff" d="M16.67 15.56l.53-3.49h-3.34V9.81c0-.95.47-1.88 1.96-1.88h1.52V4.96s-1.38-.24-2.69-.24c-2.75 0-4.54 1.67-4.54 4.69v2.66H7.08v3.49h3.05V24a12.2 12.2 0 0 0 3.74 0v-8.44h2.81z"/>
    </svg>
  );
}
