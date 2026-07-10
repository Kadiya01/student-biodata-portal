import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { AnimatedHeroGraphic } from '../components/ui/AnimatedHeroGraphic';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 md:py-12">
      {/* Brand Header */}
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <AnimatedHeroGraphic />
        
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 font-sans tracking-tight leading-tight">
          College of Health Science and Technology
        </h1>
        
        <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto font-medium">
          Complete your academic biodata registration, verify eligibility criteria, and print your official summary sheet.
        </p>
      </div>

      {/* Main Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mx-auto mt-12 px-4">
        {/* Student Portal Card */}
        <Card className="flex flex-col h-full bg-white border border-slate-100 hover:border-brand-secondary/40 transition-all duration-300 hover:shadow-premium group">
          <CardContent className="p-8 flex flex-col flex-1">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-brand-primary flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">Student Portal</h2>
            <p className="text-sm text-slate-500 mt-2 flex-grow">
              Register a new account, complete your biodata wizard, track review status, and download your registration slip.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate('/login')}
                className="flex-1"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Student Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="flex-grow md:flex-none"
              >
                Register Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Administration Portal Card */}
        <Card className="flex flex-col h-full bg-white border border-slate-100 hover:border-brand-primary/40 transition-all duration-300 hover:shadow-premium group">
          <CardContent className="p-8 flex flex-col flex-1">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-brand-accent flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">Staff Portal</h2>
            <p className="text-sm text-slate-500 mt-2 flex-grow">
              Review and approve submissions, manage reviewer accounts, and export official reports.
            </p>
            
            <div className="mt-8">
              <Button
                onClick={() => navigate('/admin-login')}
                variant="outline"
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                rightIcon={<ArrowRight className="w-4 h-4 text-slate-400" />}
              >
                Admin & Reviewer Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Bullet Highlights */}
      <div className="max-w-4xl mx-auto mt-16 px-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">
          System Core Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Automatic Credit Check</h4>
              <p className="text-xs text-slate-500 mt-1">Live calculation of credit criteria (English, Maths, and minimum 5 subjects).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Secure Audit & Comments</h4>
              <p className="text-xs text-slate-500 mt-1">Reviewers can review details and append specific correction guidelines.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Dynamic UI Exports</h4>
              <p className="text-xs text-slate-500 mt-1">Generates clean registration summaries ready to print or export as PDF/CSV.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
