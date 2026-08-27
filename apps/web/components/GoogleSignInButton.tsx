'use client';

import { useRef } from 'react';
import Script from 'next/script';
import { useAuth } from '@/lib/auth/auth-context';

type GoogleSignInButtonProps = {
  onError: (message: string) => void;
};

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();

  const renderButton = (): void => {
    const googleAccounts = window.google?.accounts;
    if (!googleAccounts || !buttonRef.current) return;

    googleAccounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (response: google.accounts.id.CredentialResponse) => {
        loginWithGoogle(response.credential).catch((err: unknown) => {
          onError(err instanceof Error ? err.message : 'An error occurred');
        });
      },
    });

    googleAccounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 350,
      text: 'continue_with',
      locale: 'en',
    });
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client?hl=en"
        strategy="afterInteractive"
        onReady={renderButton}
      />
      <div ref={buttonRef} />
    </>
  );
}
