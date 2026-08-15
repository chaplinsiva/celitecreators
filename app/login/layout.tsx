import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Celite Market',
  description: 'Log in to your Celite Market account to access your purchased templates and creator studio.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
