import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { authRepo } from '../repositories';

const resetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!token) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md mb-4 flex justify-start">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border border-slate-100 shadow-premium">
            <CardContent className="text-center py-10">
              <div className="mx-auto w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Invalid Link</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                This password reset link is invalid or missing a token.
              </p>
              <Link to="/forgot-password">
                <Button className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Request New Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md mb-4 flex justify-start">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border border-slate-100 shadow-premium">
            <CardContent className="text-center py-10">
              <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Password Reset!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Your password has been updated. You can now log in with your new password.
              </p>
              <Button
                className="w-full"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const onSubmit = async (data: ResetFormValues) => {
    setLoading(true);
    try {
      await authRepo.resetPassword(token, data.password);
      setDone(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8 bg-brand-bg dark:bg-slate-900">
        <div className="w-full max-w-md mb-4 flex justify-start">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-slate-100 shadow-premium">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Reset Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                error={errors.password?.message}
                disabled={loading}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                error={errors.confirmPassword?.message}
                disabled={loading}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Reset Password
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center text-center border-t border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Remember your password?{' '}
              <Link to="/login" className="text-brand-primary hover:text-teal-800 font-bold transition-colors">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
