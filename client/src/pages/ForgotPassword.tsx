import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { authRepo } from '../repositories';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setLoading(true);
    try {
      const result = await authRepo.forgotPassword(data.email);
      setResetLink((result as any).resetLink || null);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
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
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-500 mb-4">
                If an account exists with that email, a password reset link has been sent.
              </p>
              {resetLink && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-left">
                  <p className="text-xs font-bold text-amber-700 mb-1">Dev Mode — Reset Link:</p>
                  <a
                    href={resetLink}
                    className="text-xs text-amber-900 underline break-all font-medium"
                  >
                    {resetLink}
                  </a>
                </div>
              )}
              <Link to="/login">
                <Button className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Return to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Forgot Password?</CardTitle>
            <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                placeholder="student@college.edu.ng"
                type="email"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                error={errors.email?.message}
                disabled={loading}
                {...register('email')}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center text-center border-t border-slate-50 bg-slate-50/30">
            <p className="text-xs text-slate-500 font-semibold">
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
