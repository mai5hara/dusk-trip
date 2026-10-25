'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth/auth-context';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { Input, Button, Label } from '@mood-trip/ui';
import { signupBodySchema, type SignupBody } from '@mood-trip/validators';
import { AuthSidePanel } from '@/app/(auth)/_components/AuthSidePanel';

export default function SignUpPage() {
  const { signup } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupBody>({
    resolver: zodResolver(signupBodySchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(
    async ({ name, email, password, confirmPassword }) => {
      try {
        await signup(name, email, password, confirmPassword);
      } catch (err) {
        setError('root', {
          message: err instanceof Error ? err.message : 'An error occurred',
        });
      }
    },
  );

  return (
    <div className="flex min-h-screen">
      <AuthSidePanel />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-8 max-w-[350px] w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Sign Up</h1>
            <p className="text-sm text-text-subtle">
              Create an account to start your journey
            </p>
          </div>
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-10 w-full"
          >
            <div className="flex flex-col gap-4 items-center w-full max-w-87.5">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  variant="inset"
                  placeholder="Type your name"
                  {...register('name')}
                  errorMessage={errors.name?.message}
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  variant="inset"
                  placeholder="Type your email"
                  {...register('email')}
                  errorMessage={errors.email?.message}
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  variant="inset"
                  showPasswordToggle
                  placeholder="Type your password"
                  {...register('password')}
                  errorMessage={errors.password?.message}
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  variant="inset"
                  showPasswordToggle
                  placeholder="Confirm password"
                  {...register('confirmPassword')}
                  errorMessage={errors.confirmPassword?.message}
                />
              </div>
            </div>
            {errors.root?.message && (
              <p className="text-red-500">{errors.root.message}</p>
            )}
            <div className="flex flex-col gap-4">
              <div className="w-full max-w-87.5">
                <Button
                  type="submit"
                  variant="accent"
                  rounded="full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Loading...' : 'SIGN UP TO JOURNEY'}
                </Button>
              </div>
              <p className="text-sm">
                Already have an account?
                <Link href="/login" className="text-accent pl-2 font-bold">
                  Login to your account
                </Link>
              </p>
            </div>
          </form>
          <div className="flex items-center gap-4 w-full max-w-87.5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-subtle">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="w-full max-w-87.5">
            <GoogleSignInButton
              onError={(message) => setError('root', { message })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
