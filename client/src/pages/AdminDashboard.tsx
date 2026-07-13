import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { 
  Users, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  Search, 
  Download, 
  FileText,
  UserCheck,
  UserMinus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  Bell,
  RefreshCw,
  Plus
} from 'lucide-react';
import { adminRepo } from '../repositories';
import { generateRegistrationPDF } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';
import { Submission, User, NotificationItem } from '../api/mockDb';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isSuperAdmin = user?.role === 'super_admin';

  // Loading States
  const [loading, setLoading] = useState(true);

  // Submissions State (Reviewers & Super Admin)
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Selected student for details modal
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewerComment, setReviewerComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Reviewers State (Super Admin Only)
  const [reviewers, setReviewers] = useState<User[]>([]);
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState<User | null>(null);
  const [reviewerForm, setReviewerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // Notification logs (Super Admin Only)
  const [systemNotifications, setSystemNotifications] = useState<NotificationItem[]>([]);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Submissions
      const subRes = await adminRepo.getSubmissions();
      setSubmissions(subRes.submissions);
      setFilteredSubmissions(subRes.submissions);

      if (isSuperAdmin) {
        // Reviewers
        const revRes = await adminRepo.getReviewers();
        setReviewers(revRes.reviewers);

        // Notifications
        const notifRes = await adminRepo.getNotifications();
        setSystemNotifications(notifRes.notifications);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load portal records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isSuperAdmin]);

  // Handle student filter changes
  useEffect(() => {
    let result = submissions;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.regNumber.toLowerCase().includes(q) ||
          (s.biodata?.phone && s.biodata.phone.includes(q))
      );
    }

    if (statusFilter !== '') {
      result = result.filter((s) => s.status === statusFilter);
    }

    setFilteredSubmissions(result);
  }, [searchQuery, statusFilter, submissions]);

  // Statistics calculation
  const getReviewerStats = () => {
    return {
      total: submissions.length,
      pending: submissions.filter((s) => s.status === 'Submitted' || s.status === 'Under Review').length,
      approved: submissions.filter((s) => s.status === 'Approved').length,
      rejected: submissions.filter((s) => s.status === 'Rejected').length,
    };
  };

  const getAdminStats = () => {
    return {
      total: submissions.length,
      newRegs: submissions.filter((s) => s.status === 'Draft').length,
      pending: submissions.filter((s) => s.status === 'Submitted' || s.status === 'Under Review').length,
      approved: submissions.filter((s) => s.status === 'Approved').length,
    };
  };

  const reviewerStats = getReviewerStats();
  const adminStats = getAdminStats();

  // Review Submissions Action handlers
  const handleOpenReview = (sub: Submission) => {
    setSelectedSub(sub);
    setReviewerComment(sub.reviewerComments || '');
    setIsReviewModalOpen(true);
    // Mark as under review silently if submitted
    if (sub.status === 'Submitted') {
      adminRepo.reviewSubmission(sub.id, 'Under Review', '')
        .then(() => {
          // Refresh list quietly
          adminRepo.getSubmissions().then((res) => setSubmissions(res.submissions));
        });
    }
  };

  const handleProcessReview = async (status: 'Approved' | 'Rejected') => {
    if (!selectedSub) return;
    if (status === 'Rejected' && reviewerComment.trim() === '') {
      toast.warning('Please enter reviewer comment detailing the reason for rejection.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await adminRepo.reviewSubmission(selectedSub.id, status, reviewerComment);
      toast.success(`Student biodata record has been ${status.toLowerCase()} successfully.`);
      setIsReviewModalOpen(false);
      fetchData(); // Refresh list
    } catch (e) {
      toast.error('Failed to submit reviewer decision.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Reviewer Management Form Action handlers
  const handleOpenAddReviewer = () => {
    setEditingReviewer(null);
    setReviewerForm({ firstName: '', lastName: '', email: '', password: '' });
    setIsReviewerModalOpen(true);
  };

  const handleOpenEditReviewer = (rev: User) => {
    setEditingReviewer(rev);
    setReviewerForm({
      firstName: rev.firstName || '',
      lastName: rev.lastName || '',
      email: rev.email,
      password: '' // empty for security in edit
    });
    setIsReviewerModalOpen(true);
  };

  const handleSaveReviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerForm.firstName || !reviewerForm.email) {
      toast.warning('Please enter name and email.');
      return;
    }

    try {
      if (editingReviewer) {
        // Edit
        await adminRepo.updateReviewer(editingReviewer.id, {
          firstName: reviewerForm.firstName,
          lastName: reviewerForm.lastName,
          email: reviewerForm.email
        });
        toast.success('Reviewer account details updated.');
      } else {
        // Add
        if (!reviewerForm.password) {
          toast.warning('Please enter a login password.');
          return;
        }
        await adminRepo.createReviewer({
          firstName: reviewerForm.firstName,
          lastName: reviewerForm.lastName,
          email: reviewerForm.email,
          password: reviewerForm.password
        });
        toast.success('New reviewer account created successfully.');
      }
      setIsReviewerModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Failed to save reviewer.');
    }
  };

  const handleToggleReviewer = async (id: string, name: string) => {
    try {
      await adminRepo.toggleReviewer(id);
      toast.info(`Reviewer status toggled.`);
      fetchData();
    } catch (e) {
      toast.error('Failed to update reviewer status.');
    }
  };

  // CSV/PDF Exports
  const handleExportCSV = () => {
    toast.info('Initiating CSV compilation...');
    setTimeout(() => {
      // Build dummy CSV contents from filtered records
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Registration Number,Student Name,Programme,Submission Date,Status,Credits\n';
      
      filteredSubmissions.forEach((s) => {
        csvContent += `${s.regNumber},"${s.fullName}","${s.programme}",${new Date(s.submissionDate).toLocaleDateString()},${s.status},${s.biodata?.creditsCount || 0}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `RCHST_Submissions_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV file downloaded successfully!');
    }, 1200);
  };

  const handleExportPDF = async () => {
    toast.info('Generating PDF records booklet...');
    try {
      await generateRegistrationPDF('submissions-table', `RCHST_Submissions_Booklet_${Date.now()}`);
      toast.success('Submissions booklet exported successfully!');
    } catch {
      toast.error('Failed to generate PDF booklet. Please try again.');
    }
  };

  const handleExportSinglePDF = async (studentName: string) => {
    toast.info(`Compiling individual PDF summary sheet for ${studentName}...`);
    try {
      await generateRegistrationPDF('submissions-table', `RCHST_Student_${studentName.replace(/\s+/g, '_')}`);
      toast.success(`PDF summary for ${studentName} downloaded!`);
    } catch {
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

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
          <Skeleton className="h-96" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        
        {/* HEADER — visible to both roles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              {isSuperAdmin ? 'Super Admin Dashboard' : 'Reviewer Portal'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isSuperAdmin
                ? 'Review student submissions, manage reviewers, and track enrollment activity.'
                : 'Review student qualifications, verify SSCE credits, and approve clearances.'}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-50"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none border-slate-300 text-slate-700 hover:bg-slate-50"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export PDF Booklet
            </Button>
            {isSuperAdmin && (
              <Button
                onClick={handleOpenAddReviewer}
                leftIcon={<Plus className="w-4 h-4" />}
                size="sm"
                className="flex-1 sm:flex-none shadow-premium"
              >
                Add Reviewer
              </Button>
            )}
          </div>
        </div>

        {/* STATISTICS — visible to both roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isSuperAdmin ? 'Total Enrolled' : 'Total Students'}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{reviewerStats.total}</h3>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-brand-primary shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isSuperAdmin ? 'New Registrations' : 'Pending Review'}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{isSuperAdmin ? adminStats.newRegs : reviewerStats.pending}</h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-brand-accent shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isSuperAdmin ? 'Pending Reviews' : 'Approved Records'}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{isSuperAdmin ? adminStats.pending : reviewerStats.approved}</h3>
              </div>
              <div className="p-3 bg-sky-50 rounded-xl text-sky-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{isSuperAdmin ? 'Approved Records' : 'Rejected Records'}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{isSuperAdmin ? adminStats.approved : reviewerStats.rejected}</h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SUBMISSIONS TABLE — visible to both roles */}
        <Card className="border-slate-100 overflow-hidden">
          <CardHeader className="bg-slate-50/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Enrollment Submissions</CardTitle>
              <CardDescription>Search and filter submissions to review</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="Search by name, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="py-2.5"
              />
              <Select
                options={[
                  { label: 'All Statuses', value: '' },
                  { label: 'Submitted', value: 'Submitted' },
                  { label: 'Under Review', value: 'Under Review' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Rejected', value: 'Rejected' },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2.5 sm:w-44"
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No Student Submissions Found"
                  description="Try adjusting your search query or filters to find records."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table id="submissions-table" className="w-full text-left text-sm divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                    <tr>
                      <th className="p-4">Reg Number</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Program Group</th>
                      <th className="p-4">Submission Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-black font-mono text-teal-800 tracking-wider">
                          {sub.regNumber}
                        </td>
                        <td className="p-4 font-bold text-slate-900">{sub.fullName}</td>
                        <td className="p-4 text-xs">{sub.programme}</td>
                        <td className="p-4 text-xs font-sans">
                          {new Date(sub.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">{getStatusBadge(sub.status)}</td>
                        <td className="p-4 flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-2 py-1 text-xs"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenReview(sub)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="px-2 py-1 text-slate-400 hover:text-teal-700 hover:bg-teal-50"
                            onClick={() => handleExportSinglePDF(sub.fullName)}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SUPER ADMIN ONLY: Reviewer Management + Alerts */}
        {isSuperAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Reviewers Management List */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border border-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50/50 p-6 flex justify-between items-center">
                  <div>
                    <CardTitle>Reviewers Account Registry</CardTitle>
                    <CardDescription>Authorize, edit, or toggle reviewer credentials</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {reviewers.length === 0 ? (
                    <div className="p-8">
                      <EmptyState title="No Reviewers Registered" description="Click the button in header to add a reviewer." />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm divide-y divide-slate-100">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                          <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Account Status</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                          {reviewers.map((rev) => (
                            <tr key={rev.id} className="hover:bg-slate-50/30 transition-colors">
                              <td className="p-4 text-slate-900 font-bold">
                                {rev.firstName ? `${rev.firstName} ${rev.lastName || ''}`.trim() : 'Unnamed'}
                              </td>
                              <td className="p-4 text-xs font-sans text-slate-500">{rev.email}</td>
                              <td className="p-4">
                                {rev.status === 'active' ? (
                                  <Badge variant="success">Active</Badge>
                                ) : (
                                  <Badge variant="error">Deactivated</Badge>
                                )}
                              </td>
                              <td className="p-4 flex justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="p-2"
                                  onClick={() => handleOpenEditReviewer(rev)}
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={rev.status === 'active' ? 'danger' : 'secondary'}
                                  className="px-2.5 py-1 text-xs"
                                  onClick={() => handleToggleReviewer(rev.id, rev.firstName || '')}
                                >
                                  {rev.status === 'active' ? (
                                    <span className="flex items-center gap-1"><UserMinus className="w-3.5 h-3.5" /> Deactivate</span>
                                  ) : (
                                    <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Activate</span>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notification Logs */}
            <div className="space-y-4">
              <Card className="border border-slate-100 overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-slate-50/50 p-6 shrink-0 flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-brand-primary" /> Live Alerts Log
                    </CardTitle>
                    <CardDescription>Real-time audit log of student registrations</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 overflow-y-auto divide-y divide-slate-50 max-h-[380px] flex-grow">
                  {systemNotifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                      No system logs found
                    </div>
                  ) : (
                    systemNotifications.map((n) => (
                      <div key={n.id} className="py-3 flex flex-col gap-1 text-xs">
                        <span className="font-bold text-slate-800">{n.title}</span>
                        <span className="text-slate-500 leading-normal">{n.message}</span>
                        <span className="text-[9px] text-slate-400 font-medium font-sans">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(n.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}

        {/* DETAILS/REVIEW STUDENT MODAL */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title={`Review Submissions: ${selectedSub?.fullName || ''}`}
          size="lg"
        >
          {selectedSub && (
            <div className="space-y-6">
              
              {/* Step 1 Review */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5">
                  Personal Information
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 border bg-white">
                    <img src={selectedSub.biodata?.passportPhoto || ''} alt="Passport Photograph" className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 w-full text-xs text-slate-600 font-semibold">
                    <div>Full Name: <span className="text-slate-900 font-bold block sm:inline">{selectedSub.fullName}</span></div>
                    <div>Date of Birth: <span className="text-slate-900 font-bold">{selectedSub.biodata?.dob}</span></div>
                    <div>Gender: <span className="text-slate-900 font-bold">{selectedSub.biodata?.gender}</span></div>
                    <div>Email: <span className="text-slate-900 font-bold">{selectedSub.email}</span></div>
                    <div>Phone: <span className="text-slate-900 font-bold">{selectedSub.biodata?.phone}</span></div>
                    <div className="sm:col-span-2">Address: <span className="text-slate-900 font-bold block sm:inline">{selectedSub.biodata?.address}</span></div>
                  </div>
                </div>
              </div>

              {/* Step 2 Review */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5">
                  Educational Information
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs text-slate-600 font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>Primary: <span className="text-slate-900 font-bold block mt-0.5">{selectedSub.biodata?.primarySchool}</span></div>
                    <div>Secondary: <span className="text-slate-900 font-bold block mt-0.5">{selectedSub.biodata?.secondarySchool}</span></div>
                    <div>Exam: <span className="text-slate-900 font-bold block mt-0.5">{selectedSub.biodata?.ssceType}</span></div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mt-3">
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead className="bg-slate-50 font-bold text-slate-500">
                        <tr>
                          <th className="p-2">Subject</th>
                          <th className="p-2 text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {selectedSub.biodata?.ssceSubjects?.map((s, i) => (
                          <tr key={i}>
                            <td className="p-2">{s.subject}</td>
                            <td className="p-2 text-right font-black text-teal-800">{s.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 flex items-center justify-between font-bold">
                    <span>O-Level Credit Matches:</span>
                    <span className="text-sm font-black font-mono bg-white px-2 py-0.5 rounded border">{selectedSub.biodata?.creditsCount}</span>
                  </div>
                </div>
              </div>

              {/* Step 3 Review */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1.5">
                  Guardian Information
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 font-semibold">
                    <div>Guardian Name: <span className="text-slate-900 font-bold">{selectedSub.biodata?.guardianName}</span></div>
                    <div>Phone: <span className="text-slate-900 font-bold">{selectedSub.biodata?.guardianPhone}</span></div>
                    <div>Relationship: <span className="text-slate-900 font-bold">{selectedSub.biodata?.guardianRelationship}</span></div>
                    <div className="sm:col-span-2">Address: <span className="text-slate-900 font-bold block sm:inline">{selectedSub.biodata?.guardianAddress}</span></div>
                  </div>
                </div>
              </div>

              {/* Evaluation comments & choices */}
              {selectedSub.status !== 'Approved' && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-700">Review Comments / Reason for Rejection</span>
                  <textarea
                    className="w-full border border-slate-200 bg-white rounded-xl p-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 text-sm placeholder:text-slate-400 font-medium"
                    placeholder="Enter clearance remarks or highlight correction guidelines if rejecting..."
                    rows={3}
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                  />
                  
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsReviewModalOpen(false)}
                      disabled={isSubmittingReview}
                    >
                      Close Reviewer Panel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleProcessReview('Rejected')}
                      isLoading={isSubmittingReview}
                    >
                      Reject Submission
                    </Button>
                    <Button
                      onClick={() => handleProcessReview('Approved')}
                      isLoading={isSubmittingReview}
                    >
                      Approve & Clear Student
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* ADD/EDIT REVIEWER MODAL (SUPER ADMIN ONLY) */}
        <Modal
          isOpen={isReviewerModalOpen}
          onClose={() => setIsReviewerModalOpen(false)}
          title={editingReviewer ? 'Modify Reviewer Details' : 'Add Staff Reviewer Account'}
          size="md"
        >
          <form onSubmit={handleSaveReviewer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={reviewerForm.firstName}
                onChange={(e) => setReviewerForm({ ...reviewerForm, firstName: e.target.value })}
                placeholder="e.g. Jamilu"
              />
              <Input
                label="Last Name"
                value={reviewerForm.lastName}
                onChange={(e) => setReviewerForm({ ...reviewerForm, lastName: e.target.value })}
                placeholder="e.g. Bello"
              />
            </div>
            
            <Input
              label="Staff Email Address"
              type="email"
              value={reviewerForm.email}
              onChange={(e) => setReviewerForm({ ...reviewerForm, email: e.target.value })}
              placeholder="e.g. reviewer@college.edu.ng"
            />

            {!editingReviewer && (
              <Input
                label="Default Account Password"
                type="password"
                value={reviewerForm.password}
                onChange={(e) => setReviewerForm({ ...reviewerForm, password: e.target.value })}
                placeholder="••••••••"
              />
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewerModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Save Reviewer Account
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </SidebarLayout>
  );
}
