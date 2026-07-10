import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, Phone, ArrowLeft, ArrowRight, CheckCircle, Copy, Check } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ regNumber: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const res = await register({
        firstName,
        lastName,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      setSuccessData({ regNumber: res.regNumber });
    } catch (err) {
      // Errors handled by AuthContext toast notification
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (successData) {
      navigator.clipboard.writeText(successData.regNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8">
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
        <AnimatePresence mode="wait">
          {!successData ? (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border border-slate-100 shadow-premium">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary mb-4">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-extrabold tracking-tight">Create Student Account</CardTitle>
                  <CardDescription>Register your details to generate your registration number</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                      label="Student Full Name"
                      placeholder="e.g. Amina Yusuf"
                      type="text"
                      autoComplete="name"
                      leftIcon={<User className="w-4 h-4 text-slate-400" />}
                      error={errors.fullName?.message}
                      disabled={loading}
                      {...registerField('fullName')}
                    />

                    <Input
                      label="Email Address"
                      placeholder="e.g. amina@example.com"
                      type="email"
                      autoComplete="email"
                      leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                      error={errors.email?.message}
                      disabled={loading}
                      {...registerField('email')}
                    />

                    <Input
                      label="Phone Number"
                      placeholder="e.g. 08012345678"
                      type="tel"
                      autoComplete="tel"
                      leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
                      error={errors.phone?.message}
                      disabled={loading}
                      {...registerField('phone')}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                        leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                        error={errors.password?.message}
                        disabled={loading}
                        {...registerField('password')}
                      />

                      <Input
                        label="Confirm Password"
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                        leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                        error={errors.confirmPassword?.message}
                        disabled={loading}
                        {...registerField('confirmPassword')}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-2"
                      isLoading={loading}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Register Account
                    </Button>
                  </form>
                </CardContent>

                <CardFooter className="flex justify-center text-center border-t border-slate-50 bg-slate-50/30">
                  <p className="text-xs text-slate-500 font-semibold">
                    Already registered?{' '}
                    <Link to="/login" className="text-brand-primary hover:text-teal-800 font-bold transition-colors">
                      Log in here
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="register-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border border-emerald-100 shadow-premium overflow-hidden">
                {/* Visual success banner */}
                <div className="bg-emerald-600 p-8 text-center text-white flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white"
                  >
                    <CheckCircle className="w-10 h-10 text-white fill-emerald-600" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold tracking-tight font-sans">Registration Successful</h2>
                  <p className="text-emerald-100 text-xs mt-1 font-medium">Your portal account is active.</p>
                </div>

                <CardContent className="p-8 text-center space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                      Generated Registration Number
                    </span>
                    <div className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 py-3.5 px-5 rounded-2xl">
                      <span className="text-xl font-black text-teal-800 tracking-wider font-mono">
                        {successData.regNumber}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-brand-primary transition-colors p-1"
                        title="Copy registration number"
                      >
                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Please keep this registration number safe. You must log in using your registered credentials to complete your biodata wizard and print your official sheet.
                  </p>

                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full py-3"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Student Login
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
