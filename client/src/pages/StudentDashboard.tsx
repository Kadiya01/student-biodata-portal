import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { 
  FileText, 
  Activity, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Printer,
  Download,
  RefreshCw
} from 'lucide-react';
import { studentRepo } from '../repositories';
import { Submission } from '../api/mockDb';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
          <h2 className="text-lg font-bold text-slate-800">Failed to load dashboard</h2>
          <p className="text-sm text-slate-500">Could not fetch your biodata status. Please try again.</p>
          <Button onClick={fetchStatus} variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'Submitted':
        return <Badge variant="info">Submitted</Badge>;
      case 'Under Review':
        return <Badge variant="warning">Under Review</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </SidebarLayout>
    );
  }

  const currentStatus = submission?.status || 'Draft';
  const lastUpdated = submission?.biodata?.lastUpdated;

  return (
    <SidebarLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hello, {user?.firstName || 'Student'}!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Keep track of your biodata status and download your completed summary sheet.
            </p>
          </div>
          {currentStatus === 'Approved' && (
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/student/status')}
                variant="outline"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Summary
              </Button>
              <Button
                onClick={() => navigate('/student/status')}
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download PDF
              </Button>
            </div>
          )}
        </div>

        {/* Dashboard Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Reg Number */}
          <Card hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registration Number</p>
                <h3 className="text-lg font-black text-slate-800 tracking-wide font-mono mt-1">
                  {user?.regNumber}
                </h3>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-brand-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Biodata Status */}
          <Card hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Biodata Status</p>
                <div className="mt-2">{getStatusBadge(currentStatus)}</div>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-brand-primary shrink-0">
                <Activity className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Requirements Validation */}
          <Card hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Academic Requirements</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {submission?.biodata?.isEligible ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-emerald-700">Eligible</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-slate-500">Not Verified</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-brand-primary shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Last Updated */}
          <Card hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Updated</p>
                <h3 className="text-sm font-semibold text-slate-700 mt-2">
                  {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A'}
                </h3>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-brand-primary shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel based on submission status */}
        <Card className="border border-slate-100 overflow-hidden">
          <CardHeader className="bg-slate-50/50">
            <CardTitle>Portal Task Manager</CardTitle>
            <CardDescription>Actions required to complete your student enrollment</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {currentStatus === 'Draft' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                    <Clock className="w-3.5 h-3.5" /> Action Required: Complete Biodata
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">Fill Student Biodata Form</h3>
                  <p className="text-sm text-slate-500 max-w-xl">
                    You have not submitted your academic biodata yet. Please complete the multi-step wizard, including personal details, educational qualifications (WAEC/NECO/NABTEB), and guardian info.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/student/biodata')}
                  className="px-6 py-3 w-full md:w-auto shrink-0 shadow-premium"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Wizard Form
                </Button>
              </div>
            )}

            {currentStatus === 'Submitted' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 text-sky-700 bg-sky-50 px-3 py-1 rounded-full text-xs font-bold border border-sky-100">
                    <Clock className="w-3.5 h-3.5 bg-sky-50" /> Awaiting Reviewer Evaluation
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">Biodata Submitted Successfully</h3>
                  <p className="text-sm text-slate-500 max-w-xl">
                    Your biodata was submitted on {submission ? new Date(submission.submissionDate).toLocaleDateString() : ''}. A staff reviewer is currently evaluating your qualifications. You will receive an alert if it is approved or requires correction.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/student/status')}
                  variant="outline"
                  className="px-6 py-3 w-full md:w-auto shrink-0"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View Status Timeline
                </Button>
              </div>
            )}

            {currentStatus === 'Under Review' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                    <Clock className="w-3.5 h-3.5 animate-spin" /> In Progress: Evaluation
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">Under Formal Review</h3>
                  <p className="text-sm text-slate-500 max-w-xl">
                    An officer is currently opening and reviewing your uploaded credentials. Please check back shortly for updates.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/student/status')}
                  variant="outline"
                  className="px-6 py-3 w-full md:w-auto shrink-0"
                >
                  Track Progress
                </Button>
              </div>
            )}

            {currentStatus === 'Approved' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" /> Congratulations!
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">Biodata Verification Approved</h3>
                  <p className="text-sm text-slate-500 max-w-xl">
                    Your credentials and information meet the minimum academic criteria. You can now download or print your official registration summary sheet for physical clearance.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/student/status')}
                  className="px-6 py-3 w-full md:w-auto shrink-0"
                  rightIcon={<Download className="w-4 h-4" />}
                >
                  Get Summary PDF
                </Button>
              </div>
            )}

            {currentStatus === 'Rejected' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-3 py-1 rounded-full text-xs font-bold border border-rose-100">
                    <AlertTriangle className="w-3.5 h-3.5" /> Corrective Action Needed
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">Biodata Rejected / Correction Requested</h3>
                  <p className="text-sm text-rose-600 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 font-medium max-w-xl">
                    <strong>Reviewer Remark:</strong> {submission?.reviewerComments || 'Please verify educational grades.'}
                  </p>
                  <p className="text-sm text-slate-500 max-w-xl">
                    Please correct the fields highlighted by the reviewer and resubmit for evaluation.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/student/biodata')}
                  variant="danger"
                  className="px-6 py-3 w-full md:w-auto shrink-0"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Modify Form & Resubmit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
