import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an Account | Celite Market',
  description: 'Sign up for Celite Market to buy individual templates or start selling as a creator.',
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
