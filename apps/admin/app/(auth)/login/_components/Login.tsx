'use client';

import { useAuth } from '@/lib/auth/auth-context';
import {
  Input,
  Button,
  Label,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Field,
} from '@mood-trip/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginBody, loginBodySchema } from '@mood-trip/validators';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginBody>({
    resolver: zodResolver(loginBodySchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginBody) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-8 max-w-[450px] w-full">
        <Card variant="flat">
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex items-center flex-col gap-6"
            >
              <div className="w-full flex flex-col gap-4">
                <Field>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    variant="border"
                    placeholder="Type your email"
                    {...register('email')}
                    errorMessage={errors.email?.message}
                  />
                </Field>
                <Field>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    variant="border"
                    showPasswordToggle
                    placeholder="Type your password"
                    {...register('password')}
                    errorMessage={errors.password?.message}
                  />
                </Field>
              </div>
              <div className="w-full max-w-[200px]">
                <Button
                  type="submit"
                  variant="accent"
                  rounded="full"
                  width="full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Loading...' : 'SIGN IN'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
