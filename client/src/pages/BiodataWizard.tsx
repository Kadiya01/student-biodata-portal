import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  User, 
  BookOpen, 
  Users, 
  Eye, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  FileText,
  Calendar,
  Printer,
  Download,
  AlertTriangle
} from 'lucide-react';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { FileUpload } from '../components/ui/FileUpload';
import { Stepper } from '../components/ui/Stepper';
import { studentRepo } from '../repositories';
import { generateRegistrationPDF } from '../utils/pdfGenerator';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

// Zod schemas for multi-step validation
const today = new Date().toISOString().split('T')[0];
const maxDob = new Date();
maxDob.setFullYear(maxDob.getFullYear() - 16);
const maxDobStr = maxDob.toISOString().split('T')[0];

const step1Schema = z.object({
  passportPhoto: z.string().min(1, 'Passport photograph is required'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  dob: z.string().min(1, 'Date of birth is required')
    .refine((val) => val <= today, { message: 'Date of birth cannot be in the future' })
    .refine((val) => val <= maxDobStr, { message: 'Student must be at least 16 years old to register' }),
  gender: z.enum(['Male', 'Female'], { errorMap: () => ({ message: 'Gender is required' }) }),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Residential address is required'),
});

const subjectSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
});

const step2Schema = z.object({
  programmeId: z.string().min(1, 'Programme/Course of study is required'),
  primarySchool: z.string().min(3, 'Primary school name is required'),
  secondarySchool: z.string().min(3, 'Secondary school name is required'),
  ssceType: z.enum(['WAEC', 'NECO', 'NABTEB'], { errorMap: () => ({ message: 'SSCE Type is required' }) }),
  ssceSubjects: z.array(subjectSchema).min(5, 'Minimum 5 subjects are required'),
});

const step3Schema = z.object({
  guardianName: z.string().min(3, 'Guardian name is required'),
  guardianAddress: z.string().min(5, 'Guardian address is required'),
  guardianPhone: z.string().min(10, 'Guardian phone number is required'),
  guardianRelationship: z.enum(['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Guardian', 'Other'], {
    errorMap: () => ({ message: 'Relationship is required' })
  }),
});

const wizardSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

type WizardFormValues = z.infer<typeof wizardSchema>;

// Predefined constants
const SSCE_SUBJECTS = [
  'Biology', 'Chemistry', 'Physics', 'Geography', 'Economics', 
  'Agricultural Science', 'Government', 'Civic Education', 
  'Hausa', 'Computer Studies', 'Further Mathematics', 
  'Literature', 'CRS', 'IRS'
];

const SSCE_GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
const CREDIT_GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];

export default function BiodataWizard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // 0 = Personal, 1 = Educational, 2 = Guardian, 3 = Review, 4 = Success
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);

  const steps = [
    { title: 'Personal', description: 'Personal Information' },
    { title: 'Educational', description: 'Academic Records' },
    { title: 'Guardian', description: 'Guardian Details' },
    { title: 'Review', description: 'Verification & Submit' },
  ];

  // Initialize main form hook
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      step1: {
        passportPhoto: '',
        fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
        dob: '',
        gender: undefined as any,
        email: user?.email || '',
        phone: '',
        address: '',
      },
      step2: {
        programmeId: '',
        primarySchool: '',
        secondarySchool: '',
        ssceType: undefined as any,
        ssceSubjects: [
          { subject: 'English Language', grade: '' },
          { subject: 'Mathematics', grade: '' },
        ],
      },
      step3: {
        guardianName: '',
        guardianAddress: '',
        guardianPhone: '',
        guardianRelationship: undefined as any,
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'step2.ssceSubjects',
  });

  const [programmes, setProgrammes] = useState<{ id: string; name: string; code: string }[]>([]);

  useEffect(() => {
    api.get('/programmes').then((res) => {
      setProgrammes(res.data.programmes || []);
    }).catch(() => {});
  }, []);

  // Load existing draft if present
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await studentRepo.getBiodata();
        if (res.submission) {
          const sub = res.submission;
          
          // If approved, redirect to status page
          if (sub.status === 'Approved') {
            navigate('/student/status');
            return;
          }

          // If Under Review or Submitted, show read-only view at review step
          if (sub.status === 'Under Review' || sub.status === 'Submitted') {
            setReadOnly(true);
          }

          const bio = sub.biodata;
          if (bio) {
            setValue('step1.fullName', bio.fullName || '');
            setValue('step1.dob', bio.dob || '');
            setValue('step1.gender', (bio.gender || '') as any);
            setValue('step1.email', bio.email || '');
            setValue('step1.phone', bio.phone || '');
            setValue('step1.address', bio.address || '');
            setValue('step1.passportPhoto', bio.passportPhoto || '');
            
            setValue('step2.primarySchool', bio.primarySchool || '');
            setValue('step2.secondarySchool', bio.secondarySchool || '');
            setValue('step2.ssceType', (bio.ssceType || '') as any);
            if (bio.ssceSubjects && bio.ssceSubjects.length >= 2) {
              setValue('step2.ssceSubjects', bio.ssceSubjects);
            }
            if (bio.programmeId) {
              setValue('step2.programmeId', bio.programmeId);
            }

            setValue('step3.guardianName', bio.guardianName || '');
            setValue('step3.guardianAddress', bio.guardianAddress || '');
            setValue('step3.guardianPhone', bio.guardianPhone || '');
            setValue('step3.guardianRelationship', (bio.guardianRelationship || '') as any);

            // Jump to review step for read-only or Rejected
            if (sub.status === 'Under Review' || sub.status === 'Submitted') {
              setCurrentStep(3);
            }
          }
        }
      } catch (err) {
        // Draft load failed — form will start with default values
      }
    };
    loadDraft();
  }, [setValue, navigate]);

  // Watch field values for live credit calculation
  const ssceSubjects = watch('step2.ssceSubjects') || [];

  // Live Credit Counter & Eligibility verification
  const calculateCredits = () => {
    let credits = 0;
    let hasEnglishCredit = false;
    let hasMathCredit = false;

    ssceSubjects.forEach((sub) => {
      const isCredit = CREDIT_GRADES.includes(sub.grade);
      if (isCredit) {
        credits++;
        if (sub.subject === 'English Language') hasEnglishCredit = true;
        if (sub.subject === 'Mathematics') hasMathCredit = true;
      }
    });

    const isEligible = credits >= 5 && hasEnglishCredit && hasMathCredit;

    return {
      credits,
      hasEnglishCredit,
      hasMathCredit,
      isEligible,
    };
  };

  const { credits, hasEnglishCredit, hasMathCredit, isEligible } = calculateCredits();

  // Navigation handlers
  const handleNext = async () => {
    if (readOnly) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Validate current step fields before proceeding
    let isValid = false;
    if (currentStep === 0) {
      isValid = await trigger('step1');
    } else if (currentStep === 1) {
      isValid = await trigger('step2');
      if (isValid && !isEligible) {
        toast.warning('You do not meet the minimum eligibility requirement to proceed.');
        return;
      }
    } else if (currentStep === 2) {
      isValid = await trigger('step3');
    }

    if (isValid) {
      // Auto-save draft on moving to next steps
      try {
        const formData = watch();
        const formattedBiodata = {
          ...formData.step1,
          ...formData.step2,
          ...formData.step3,
          creditsCount: credits,
          isEligible,
        };
        await studentRepo.saveBiodata({ biodata: formattedBiodata, action: 'save' });
      } catch (e) {
        toast.error('Failed to auto-save draft. Your changes may not be saved.');
      }
      
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error('Please correct all validation errors in the form.');
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSaveDraft = async () => {
    try {
      const formData = watch();
      const formattedBiodata = {
        ...formData.step1,
        ...formData.step2,
        ...formData.step3,
        creditsCount: credits,
        isEligible,
      };
      await studentRepo.saveBiodata({ biodata: formattedBiodata, action: 'save' });
      toast.success('Draft saved successfully!');
    } catch (e) {
      toast.error('Failed to save draft.');
    }
  };

  const onSubmitAll = async (data: WizardFormValues) => {
    if (!isEligible) {
      toast.error('Form cannot be submitted. You do not meet the minimum academic criteria.');
      return;
    }

    setLoading(true);
    try {
      const formattedBiodata = {
        ...data.step1,
        ...data.step2,
        ...data.step3,
        creditsCount: credits,
        isEligible,
      };

      const res = await studentRepo.saveBiodata({
        biodata: formattedBiodata,
        action: 'submit',
      });

      setSubmissionReceipt(res.submission);
      toast.success('Biodata Submitted Successfully!');
      setCurrentStep(4); // Show success receipt
      await refreshUser();
    } catch (err) {
      toast.error('Failed to submit biodata. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {currentStep < 4 && (
          <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl md:2xl font-black text-slate-800 tracking-tight">
                  {readOnly ? 'Biodata Summary (Read-Only)' : 'Biodata Wizard Form'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {readOnly
                    ? 'Your biodata is currently under review. You can view but not edit.'
                    : 'Complete all steps carefully. Your data must pass academic requirements.'}
                </p>
              </div>
              {!readOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  className="w-full sm:w-auto"
                >
                  Save Draft
                </Button>
              )}
            </div>

            {/* Stepper Wizard Indicator */}
            <Card className="p-4 border-slate-100">
              <Stepper steps={steps} currentStep={currentStep} />
            </Card>
          </>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Personal Info */}
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-primary" /> Step 1: Personal Information
                  </CardTitle>
                  <CardDescription>Enter details matching your official birth certificate and identities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo upload */}
                  <Controller
                    control={control}
                    name="step1.passportPhoto"
                    render={({ field }) => (
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        label="Passport Photograph (JPEG/PNG, Max 2MB)"
                        error={errors.step1?.passportPhoto?.message}
                      />
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Enter full name"
                      error={errors.step1?.fullName?.message}
                      {...register('step1.fullName')}
                    />

                    <Input
                      label="Date of Birth"
                      type="date"
                      max={maxDobStr}
                      error={errors.step1?.dob?.message}
                      {...register('step1.dob')}
                    />

                    <Controller
                      control={control}
                      name="step1.gender"
                      render={({ field }) => (
                        <Select
                          label="Gender"
                          options={[
                            { label: 'Select Gender', value: '' },
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' },
                          ]}
                          error={errors.step1?.gender?.message}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />

                    <Input
                      label="Institution/Personal Email"
                      placeholder="e.g. email@example.com"
                      type="email"
                      error={errors.step1?.email?.message}
                      {...register('step1.email')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Mobile Phone Number"
                      placeholder="e.g. 08031234567"
                      error={errors.step1?.phone?.message}
                      {...register('step1.phone')}
                    />

                    <Input
                      label="Residential Address"
                      placeholder="Enter home address"
                      error={errors.step1?.address?.message}
                      {...register('step1.address')}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 bg-slate-50/50">
                  <Button
                    onClick={handleNext}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Educational Records
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Educational Info */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-brand-primary" /> Step 2: Educational Qualifications
                  </CardTitle>
                  <CardDescription>Enter details of primary, secondary, and SSCE results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="w-full">
                    <Controller
                      control={control}
                      name="step2.programmeId"
                      render={({ field }) => (
                        <Select
                          label="Programme / Course of Study"
                          options={[
                            { label: 'Select Programme', value: '' },
                            ...programmes.map((p) => ({ label: `${p.name} (${p.code})`, value: p.id })),
                          ]}
                          error={errors.step2?.programmeId?.message}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Primary School Attended"
                      placeholder="Name of primary school"
                      error={errors.step2?.primarySchool?.message}
                      {...register('step2.primarySchool')}
                    />

                    <Input
                      label="Secondary School Attended"
                      placeholder="Name of secondary school"
                      error={errors.step2?.secondarySchool?.message}
                      {...register('step2.secondarySchool')}
                    />
                  </div>

                  <div className="w-full">
                    <Controller
                      control={control}
                      name="step2.ssceType"
                      render={({ field }) => (
                        <Select
                          label="SSCE Examination Body"
                          options={[
                            { label: 'Select Exam Body', value: '' },
                            { label: 'WAEC', value: 'WAEC' },
                            { label: 'NECO', value: 'NECO' },
                            { label: 'NABTEB', value: 'NABTEB' },
                          ]}
                          error={errors.step2?.ssceType?.message}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  {/* SSCE Subject Matrix */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        SSCE Subjects & Grades
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ subject: '', grade: '' })}
                        leftIcon={<Plus className="w-4 h-4" />}
                      >
                        Add Subject
                      </Button>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-sm divide-y divide-slate-100">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                          <tr>
                            <th className="p-4 w-2/3">Subject</th>
                            <th className="p-4 w-1/4">Grade Obtained</th>
                            <th className="p-4 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fields.map((field, idx) => {
                            const isDefault = idx < 2; // Locked English and Math
                            
                            return (
                              <tr key={field.id} className="hover:bg-slate-50/50">
                                <td className="p-3">
                                  {isDefault ? (
                                    <div className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-xl">
                                      {field.subject}
                                    </div>
                                  ) : (
                                    <Controller
                                      control={control}
                                      name={`step2.ssceSubjects.${idx}.subject`}
                                      render={({ field: subField }) => (
                                        <select
                                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
                                          value={subField.value}
                                          onChange={subField.onChange}
                                        >
                                          <option value="">Select Subject</option>
                                          {SSCE_SUBJECTS.map((s) => (
                                            <option key={s} value={s}>
                                              {s}
                                            </option>
                                          ))}
                                        </select>
                                      )}
                                    />
                                  )}
                                </td>
                                <td className="p-3">
                                  <Controller
                                    control={control}
                                    name={`step2.ssceSubjects.${idx}.grade`}
                                    render={({ field: gradeField }) => (
                                      <select
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 cursor-pointer font-bold text-slate-800"
                                        value={gradeField.value}
                                        onChange={gradeField.onChange}
                                      >
                                        <option value="">Grade</option>
                                        {SSCE_GRADES.map((g) => (
                                          <option key={g} value={g}>
                                            {g}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  {!isDefault && (
                                    <button
                                      type="button"
                                      onClick={() => remove(idx)}
                                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                                      title="Remove subject"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Credit Counter & Eligibility panel */}
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Academic Credit Verification
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Credits count are automatically updated live (A1 - C6 are credit passes)
                        </p>
                      </div>
                      <div className="bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2 text-center shrink-0">
                        <span className="text-2xl font-black text-slate-800 font-mono leading-none">
                          {credits}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mt-0.5">
                          Credits
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                      <div className={`p-3 rounded-xl border flex items-center gap-2 bg-white ${hasEnglishCredit ? 'border-emerald-100 text-emerald-800' : 'border-rose-100 text-rose-800'}`}>
                        {hasEnglishCredit ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                        English Language Credit Pass
                      </div>
                      <div className={`p-3 rounded-xl border flex items-center gap-2 bg-white ${hasMathCredit ? 'border-emerald-100 text-emerald-800' : 'border-rose-100 text-rose-800'}`}>
                        {hasMathCredit ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                        Mathematics Credit Pass
                      </div>
                    </div>

                    {/* Final eligibility label */}
                    {isEligible ? (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">Eligible for Submission</p>
                          <p className="text-xs text-emerald-600 font-medium mt-1">
                            ✔ You meet the minimum academic enrollment requirements. You can proceed.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">Not Eligible</p>
                          <p className="text-xs text-rose-600 font-medium mt-1 leading-normal">
                            Minimum 5 credits required. English and Mathematics must both have credit passes (A1 - C6).
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50/50">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isEligible}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Guardian Info
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: Guardian Info */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-primary" /> Step 3: Guardian Information
                  </CardTitle>
                  <CardDescription>Enter emergency contact details and relationships</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Guardian Full Name"
                      placeholder="Name of parent or guardian"
                      error={errors.step3?.guardianName?.message}
                      {...register('step3.guardianName')}
                    />

                    <Input
                      label="Guardian Phone Number"
                      placeholder="Guardian telephone"
                      error={errors.step3?.guardianPhone?.message}
                      {...register('step3.guardianPhone')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      control={control}
                      name="step3.guardianRelationship"
                      render={({ field }) => (
                        <Select
                          label="Relationship with Student"
                          options={[
                            { label: 'Select Relationship', value: '' },
                            { label: 'Father', value: 'Father' },
                            { label: 'Mother', value: 'Mother' },
                            { label: 'Brother', value: 'Brother' },
                            { label: 'Sister', value: 'Sister' },
                            { label: 'Uncle', value: 'Uncle' },
                            { label: 'Aunt', value: 'Aunt' },
                            { label: 'Guardian', value: 'Guardian' },
                            { label: 'Other', value: 'Other' },
                          ]}
                          error={errors.step3?.guardianRelationship?.message}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />

                    <Input
                      label="Guardian Contact Address"
                      placeholder="Address of parent or guardian"
                      error={errors.step3?.guardianAddress?.message}
                      {...register('step3.guardianAddress')}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50/50">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Review details
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: Review Page */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-brand-primary" /> Step 4: Final Summary Review
                  </CardTitle>
                  <CardDescription>Confirm your entries before final portal submission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1 Review */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
                      Personal Information
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 border bg-white">
                        <img src={watch('step1.passportPhoto')} alt="Passport" className="w-full h-full object-cover" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 w-full text-xs text-slate-600 font-semibold">
                        <div>Full Name: <span className="text-slate-900 font-bold ml-1">{watch('step1.fullName')}</span></div>
                        <div>Date of Birth: <span className="text-slate-900 font-bold ml-1">{watch('step1.dob')}</span></div>
                        <div>Gender: <span className="text-slate-900 font-bold ml-1">{watch('step1.gender')}</span></div>
                        <div>Email: <span className="text-slate-900 font-bold ml-1">{watch('step1.email')}</span></div>
                        <div>Phone: <span className="text-slate-900 font-bold ml-1">{watch('step1.phone')}</span></div>
                        <div className="sm:col-span-2">Address: <span className="text-slate-900 font-bold ml-1">{watch('step1.address')}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Review */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
                      Educational Records
                    </h4>
                    <div className="p-4 bg-slate-50 rounded-2xl space-y-3 text-xs text-slate-600 font-semibold">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>Programme: <span className="text-slate-900 font-bold block mt-1">{programmes.find(p => p.id === watch('step2.programmeId'))?.name || 'Not selected'}</span></div>
                        <div>Primary School: <span className="text-slate-900 font-bold block mt-1">{watch('step2.primarySchool')}</span></div>
                        <div>Secondary School: <span className="text-slate-900 font-bold block mt-1">{watch('step2.secondarySchool')}</span></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>SSCE Body: <span className="text-slate-900 font-bold block mt-1">{watch('step2.ssceType')}</span></div>
                      </div>

                      <div className="mt-4 border border-slate-200/60 rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-left text-xs divide-y divide-slate-100">
                          <thead className="bg-slate-50 font-bold text-slate-500">
                            <tr>
                              <th className="p-3">Subject</th>
                              <th className="p-3 text-right">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {ssceSubjects.map((s, i) => (
                              <tr key={i}>
                                <td className="p-3 font-semibold">{s.subject}</td>
                                <td className="p-3 text-right font-black text-teal-800">{s.grade}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="p-3 bg-emerald-50 border border-emerald-100/50 rounded-xl text-emerald-800 flex items-center justify-between mt-2 font-bold">
                        <span>Total Verification Credits:</span>
                        <span className="text-base font-black font-mono bg-white px-2 py-0.5 rounded-lg border">{credits}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Review */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">
                      Guardian Details
                    </h4>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-600 font-semibold">
                        <div>Guardian Name: <span className="text-slate-900 font-bold ml-1">{watch('step3.guardianName')}</span></div>
                        <div>Guardian Phone: <span className="text-slate-900 font-bold ml-1">{watch('step3.guardianPhone')}</span></div>
                        <div>Relationship: <span className="text-slate-900 font-bold ml-1">{watch('step3.guardianRelationship')}</span></div>
                        <div className="sm:col-span-2">Contact Address: <span className="text-slate-900 font-bold ml-1">{watch('step3.guardianAddress')}</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-slate-50/50">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    disabled={loading}
                  >
                    Previous
                  </Button>
                  {readOnly ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handlePrint}
                        leftIcon={<Printer className="w-4 h-4" />}
                      >
                        Print
                      </Button>
                      <Button
                        onClick={() => navigate('/student')}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleSubmit(onSubmitAll)}
                      isLoading={loading}
                      disabled={!isEligible}
                      rightIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Submit Biodata Form
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* STEP 5: Success Receipt Card */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card id="registration-summary" className="border border-emerald-100 shadow-premium overflow-hidden">
                <div className="bg-emerald-700 p-8 text-center text-white flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="w-10 h-10 text-white fill-emerald-700" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold tracking-tight font-sans">Congratulations!</h2>
                  <p className="text-emerald-100 text-xs mt-1 font-medium">Your biodata has been submitted successfully.</p>
                </div>

                <CardContent className="p-8 space-y-6">
                  {/* Summary card details */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Registration Summary Card
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                      <div>
                        Registration Number:
                        <span className="text-slate-900 block font-black font-mono text-sm tracking-wide mt-0.5">
                          {submissionReceipt?.regNumber || user?.regNumber || 'N/A'}
                        </span>
                      </div>
                      <div>
                        Student Full Name:
                        <span className="text-slate-900 block font-bold text-sm mt-0.5">
                          {submissionReceipt?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'N/A'}
                        </span>
                      </div>
                      <div>
                        Submission Date:
                        <span className="text-slate-900 block font-semibold mt-0.5">
                          {submissionReceipt?.submissionDate ? new Date(submissionReceipt.submissionDate).toLocaleDateString() : new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        Current Status:
                        <span className="block mt-1">
                          <Badge variant="info">Submitted</Badge>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      className="flex-1"
                      leftIcon={<Printer className="w-4 h-4" />}
                    >
                      Print Summary
                    </Button>
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      className="flex-1 border-teal-300 text-teal-800 hover:bg-teal-50"
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Download PDF
                    </Button>
                    <Button
                      onClick={() => navigate('/student')}
                      className="flex-1"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SidebarLayout>
  );
}
