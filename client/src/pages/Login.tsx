import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      // Errors handled by AuthContext toast notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      {/* Back button */}
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
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
              <GraduationCap className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Student Portal Login</CardTitle>
            <CardDescription>Enter credentials to access your biodata dashboard</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Institution Email Address"
                placeholder="student@college.edu.ng"
                type="email"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                error={errors.email?.message}
                disabled={loading}
                {...register('email')}
              />

              <Input
                label="Portal Password"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                error={errors.password?.message}
                disabled={loading}
                {...register('password')}
              />

              <div className="text-right">
                <Link to="/forgot-password" className="text-xs font-bold text-brand-primary hover:text-teal-800 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Log In to Portal
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 text-center border-t border-slate-50 bg-slate-50/30">
            <p className="text-xs text-slate-500 font-semibold">
              New student?{' '}
              <Link to="/register" className="text-brand-primary hover:text-teal-800 font-bold transition-colors">
                Create account now
              </Link>
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Are you a staff member?{' '}
              <Link to="/admin-login" className="text-slate-600 hover:text-slate-900 underline font-semibold transition-colors">
                Access Staff Portal
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
