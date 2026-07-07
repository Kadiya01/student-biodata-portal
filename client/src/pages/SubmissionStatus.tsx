import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { 
  Check, 
  Clock, 
  FileText, 
  HelpCircle, 
  AlertTriangle, 
  FileCheck,
  Printer,
  Download,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { studentRepo } from '../repositories';
import { generateRegistrationPDF } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';
import { Submission } from '../api/mockDb';

export default function SubmissionStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [fetchError, setFetchError] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await studentRepo.getBiodata();
      setSubmission(res.submission);
    } catch (e) {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (fetchError) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="w-12 h-12 text-rose-400" />
          <h2 className="text-lg font-bold text-slate-800">Failed to load status</h2>
          <p className="text-sm text-slate-500">Could not fetch your submission details. Please try again.</p>
          <Button onClick={fetchStatus} variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    toast.info('Generating PDF download file...');
    try {
      await generateRegistrationPDF('registration-summary', `RCHST_Registration_${user?.regNumber}`);
      toast.success('Registration summary PDF generated successfully!');
    } catch {
      toast.error('Failed to generate PDF. Please try Print instead.');
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64" />
        </div>
      </SidebarLayout>
    );
  }

  const currentStatus = submission?.status || 'Draft';

  // Timeline definition
  const timelineSteps = [
    { key: 'Draft', title: 'Draft Saved', description: 'Form being filled by student', icon: <FileText className="w-5 h-5" /> },
    { key: 'Submitted', title: 'Submitted', description: 'Awaiting reviewer assignment', icon: <Clock className="w-5 h-5" /> },
    { key: 'Under Review', title: 'Under Review', description: 'Credentials being evaluated', icon: <HelpCircle className="w-5 h-5" /> },
    { key: 'Final', title: 'Final Decision', description: 'Approved or Rejected status', icon: <FileCheck className="w-5 h-5" /> },
  ];

  // Helper to determine the visual state of a step
  const getStepState = (stepKey: string, index: number) => {
    if (currentStatus === 'Rejected' && stepKey === 'Final') {
      return 'rejected';
    }
    if (currentStatus === 'Approved' && stepKey === 'Final') {
      return 'approved';
    }

    const statusIndexMap: Record<string, number> = {
      'Draft': 0,
      'Submitted': 1,
      'Under Review': 2,
      'Approved': 3,
      'Rejected': 3
    };

    const currentStepIndex = statusIndexMap[currentStatus] ?? 0;
    
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Submission Status Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track the review history and progress of your academic enrollment biodata.
          </p>
        </div>

        {/* Timeline Visual Display */}
        <Card className="border-slate-100">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
              {timelineSteps.map((step, idx) => {
                const state = getStepState(step.key, idx);
                
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex items-center md:flex-col text-left md:text-center gap-4 md:gap-3 flex-1 relative z-10">
                      {/* Step icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                          ${
                            state === 'completed'
                              ? 'bg-brand-primary border-brand-primary text-white shadow-premium'
                              : state === 'active'
                              ? 'bg-teal-50 border-brand-primary text-brand-primary ring-4 ring-teal-50/50 scale-105'
                              : state === 'approved'
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-premium'
                              : state === 'rejected'
                              ? 'bg-rose-500 border-rose-500 text-white shadow-premium'
                              : 'bg-white border-slate-200 text-slate-300'
                          }
                        `}
                      >
                        {state === 'completed' || state === 'approved' ? (
                          <Check className="w-6 h-6" />
                        ) : state === 'rejected' ? (
                          <Check className="w-6 h-6" /> // still checked or cross
                        ) : (
                          step.icon
                        )}
                      </div>
                      
                      {/* Labels */}
                      <div className="space-y-0.5">
                        <h4
                          className={`text-xs font-bold uppercase tracking-wider
                            ${
                              state === 'completed'
                                ? 'text-slate-700'
                                : state === 'active'
                                ? 'text-brand-primary'
                                : state === 'approved'
                                ? 'text-emerald-600'
                                : state === 'rejected'
                                ? 'text-rose-600'
                                : 'text-slate-400'
                            }
                          `}
                        >
                          {step.key === 'Final'
                            ? currentStatus === 'Approved'
                              ? 'Approved'
                              : currentStatus === 'Rejected'
                              ? 'Rejected'
                              : 'Final Decision'
                            : step.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium max-w-[140px] md:mx-auto leading-tight">
                          {step.key === 'Final' && currentStatus === 'Rejected'
                            ? 'Correction guidelines set'
                            : step.description}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Connector Line */}
                    {idx < timelineSteps.length - 1 && (
                      <div className="hidden md:block flex-1 h-0.5 bg-slate-100 rounded-full relative -mt-8">
                        <div
                          className={`absolute inset-0 h-full transition-all duration-500 ease-in-out rounded-full
                            ${
                              getStepState(timelineSteps[idx + 1].key, idx + 1) !== 'pending'
                                ? 'bg-brand-primary'
                                : 'bg-slate-100'
                            }
                          `}
                          style={{
                            width: getStepState(timelineSteps[idx + 1].key, idx + 1) !== 'pending' ? '100%' : '0%',
                          }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Status Report */}
        <Card id="registration-summary" className="border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Status Summary Details
            </h3>
            <Badge
              variant={
                currentStatus === 'Approved'
                  ? 'success'
                  : currentStatus === 'Rejected'
                  ? 'error'
                  : currentStatus === 'Submitted'
                  ? 'info'
                  : currentStatus === 'Under Review'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {currentStatus}
            </Badge>
          </div>
          
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
              <div>
                Registration ID:
                <span className="text-slate-900 block font-black font-mono text-sm tracking-wide mt-0.5">
                  {user?.regNumber}
                </span>
              </div>
              <div>
                Submission Queue:
                <span className="text-slate-900 block font-bold text-sm mt-0.5">
                  General Admission Bio-data Verification
                </span>
              </div>
              {submission?.submissionDate && (
                <div>
                  Submitted Date:
                  <span className="text-slate-900 block font-semibold mt-0.5 font-sans">
                    {new Date(submission.submissionDate).toLocaleString()}
                  </span>
                </div>
              )}
              {submission?.biodata?.lastUpdated && (
                <div>
                  Last Update Stamp:
                  <span className="text-slate-900 block font-semibold mt-0.5 font-sans">
                    {new Date(submission.biodata.lastUpdated).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* If Rejected display remarks */}
            {currentStatus === 'Rejected' && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-800 text-sm font-bold">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  Reviewer Correction Guidelines
                </div>
                <p className="text-xs text-rose-700 font-medium leading-relaxed bg-white border border-rose-100/50 p-4 rounded-xl shadow-xs">
                  {submission?.reviewerComments || 'No reviewer comments provided. Please verify subject grades.'}
                </p>
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => navigate('/student/biodata')}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Edit Biodata Form
                  </Button>
                </div>
              </div>
            )}

            {/* Actions for approved status */}
            {currentStatus === 'Approved' && (
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
                  <FileCheck className="w-5 h-5 shrink-0" />
                  Verification Sheet Available
                </div>
                <p className="text-xs text-emerald-700 leading-normal font-medium">
                  Your details have been checked and approved by the academic reviewer. You can download or print your official clearance slip below. Take a copy to the registry department.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="flex-1 bg-white"
                    leftIcon={<Printer className="w-4 h-4" />}
                  >
                    Print Summary
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    className="flex-1"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
