import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

const adminLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/admin');
    } catch (err) {
      // Errors handled by AuthContext toast notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-6 self-center md:absolute md:top-24 md:left-24"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-slate-100 shadow-premium">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-brand-accent mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight">Staff Portal Login</CardTitle>
            <CardDescription>Administrative access for Reviewers and Super Admins</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Staff Email Address"
                placeholder="staff@college.edu.ng"
                type="email"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                error={errors.email?.message}
                disabled={loading}
                {...register('email')}
              />

              <Input
                label="Portal Password"
                placeholder="••••••••"
                type="password"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                error={errors.password?.message}
                disabled={loading}
                {...register('password')}
              />

              <div className="text-right">
                <a href="#forgot" className="text-xs font-bold text-brand-accent hover:text-amber-600 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full mt-2"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Log In to Dashboard
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center text-center border-t border-slate-50 bg-slate-50/30">
            <p className="text-xs text-slate-500 font-semibold">
              Are you a student?{' '}
              <Link to="/login" className="text-brand-primary hover:text-teal-800 font-bold transition-colors">
                Go to Student Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
