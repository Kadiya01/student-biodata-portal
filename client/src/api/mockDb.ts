// Mock Database schema and seed data stored in LocalStorage

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'reviewer' | 'super_admin';
  regNumber?: string; // Only for student
  password?: string; // For mock auth checks
  status?: string; // For reviewer account status (active, inactive)
}

export interface SSCEGrade {
  subject: string;
  grade: string;
}

export interface StudentBiodata {
  // Step 1
  passportPhoto?: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | '';
  email: string;
  phone: string;
  address: string;
  // Step 2
  primarySchool: string;
  secondarySchool: string;
  ssceType: 'WAEC' | 'NECO' | 'NABTEB' | '';
  ssceSubjects: SSCEGrade[];
  creditsCount: number;
  isEligible: boolean;
  // Step 3
  guardianName: string;
  guardianAddress: string;
  guardianPhone: string;
  guardianRelationship: string;
  // Metadata
  lastUpdated?: string;
}

export interface Submission {
  id: string;
  studentId: string;
  regNumber: string;
  fullName: string;
  email: string;
  programme: string;
  submissionDate: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  biodata: StudentBiodata;
  reviewerComments?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'u-student-1',
    email: 'student@rauda.edu.ng',
    firstName: 'Amina',
    lastName: 'Yusuf',
    role: 'student',
    regNumber: 'RCHST-2026-00045',
  },
  {
    id: 'u-reviewer-1',
    email: 'reviewer@rauda.edu.ng',
    firstName: 'Jamilu',
    lastName: 'Bello',
    role: 'reviewer',
    status: 'active',
  },
  {
    id: 'u-admin-1',
    email: 'admin@rauda.edu.ng',
    firstName: 'Prof. Ibrahim',
    lastName: 'Adamu',
    role: 'super_admin',
  }
];

const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    studentId: 'u-student-1',
    regNumber: 'RCHST-2026-00045',
    fullName: 'Amina Yusuf',
    email: 'student@rauda.edu.ng',
    programme: 'Community Health Extension Worker (CHEW)',
    submissionDate: '2026-06-28T14:32:00+01:00',
    status: 'Submitted',
    biodata: {
      passportPhoto: '',
      fullName: 'Amina Yusuf',
      dob: '2004-05-12',
      gender: 'Female',
      email: 'student@rauda.edu.ng',
      phone: '08031234567',
      address: 'No 12, Gwarimpa Estate, Abuja',
      primarySchool: 'Model Primary School, Zaria',
      secondarySchool: 'Government Girls Secondary School, Kaduna',
      ssceType: 'WAEC',
      ssceSubjects: [
        { subject: 'English Language', grade: 'B3' },
        { subject: 'Mathematics', grade: 'C4' },
        { subject: 'Biology', grade: 'B2' },
        { subject: 'Chemistry', grade: 'C5' },
        { subject: 'Physics', grade: 'C6' },
      ],
      creditsCount: 5,
      isEligible: true,
      guardianName: 'Yusuf Ibrahim',
      guardianAddress: 'No 12, Gwarimpa Estate, Abuja',
      guardianPhone: '08069876543',
      guardianRelationship: 'Father',
      lastUpdated: '2026-06-28T14:30:00+01:00',
    }
  },
  {
    id: 'sub-2',
    studentId: 'u-student-2',
    regNumber: 'RCHST-2026-00012',
    fullName: 'Chidi Okafor',
    email: 'chidi.okafor@gmail.com',
    programme: 'Medical Laboratory Technician (MLT)',
    submissionDate: '2026-06-30T10:15:00+01:00',
    status: 'Approved',
    biodata: {
      passportPhoto: '',
      fullName: 'Chidi Okafor',
      dob: '2005-09-22',
      gender: 'Male',
      email: 'chidi.okafor@gmail.com',
      phone: '08123456789',
      address: '24 Court Road, Sabon Gari, Kano',
      primarySchool: 'St. Louis Primary School, Kano',
      secondarySchool: 'Science Secondary School, Kano',
      ssceType: 'NECO',
      ssceSubjects: [
        { subject: 'English Language', grade: 'C5' },
        { subject: 'Mathematics', grade: 'B2' },
        { subject: 'Biology', grade: 'A1' },
        { subject: 'Chemistry', grade: 'B3' },
        { subject: 'Physics', grade: 'C4' },
        { subject: 'Agricultural Science', grade: 'B3' }
      ],
      creditsCount: 6,
      isEligible: true,
      guardianName: 'Stella Okafor',
      guardianAddress: '24 Court Road, Sabon Gari, Kano',
      guardianPhone: '08098765432',
      guardianRelationship: 'Mother',
      lastUpdated: '2026-06-30T10:10:00+01:00',
    }
  },
  {
    id: 'sub-3',
    studentId: 'u-student-3',
    regNumber: 'RCHST-2026-00088',
    fullName: 'Fatima Abubakar',
    email: 'fatima.abubakar@yahoo.com',
    programme: 'Pharmacy Technician',
    submissionDate: '2026-06-29T16:45:00+01:00',
    status: 'Rejected',
    reviewerComments: 'Passport photograph is blurred. Please upload a clear passport photograph.',
    biodata: {
      passportPhoto: '',
      fullName: 'Fatima Abubakar',
      dob: '2003-11-05',
      gender: 'Female',
      email: 'fatima.abubakar@yahoo.com',
      phone: '09012345678',
      address: '32 Katsina Road, Katsina',
      primarySchool: 'Umaru Musa Primary School, Katsina',
      secondarySchool: 'GGSS Bakori, Katsina',
      ssceType: 'WAEC',
      ssceSubjects: [
        { subject: 'English Language', grade: 'C4' },
        { subject: 'Mathematics', grade: 'C6' },
        { subject: 'Biology', grade: 'B3' },
        { subject: 'Chemistry', grade: 'D7' }, // Fail
        { subject: 'Physics', grade: 'E8' }, // Fail
        { subject: 'Economics', grade: 'C5' },
        { subject: 'Civic Education', grade: 'C6' }
      ],
      creditsCount: 5,
      isEligible: true,
      guardianName: 'Abubakar Kabir',
      guardianAddress: '32 Katsina Road, Katsina',
      guardianPhone: '07034567890',
      guardianRelationship: 'Uncle',
      lastUpdated: '2026-06-29T16:40:00+01:00',
    }
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Student Registered',
    message: 'Name: Amina Yusuf | Registration Number: RCHST-2026-00045',
    timestamp: '2026-06-28T14:32:00+01:00',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'New Student Registered',
    message: 'Name: Chidi Okafor | Registration Number: RCHST-2026-00012',
    timestamp: '2026-06-30T10:15:00+01:00',
    read: false,
  }
];

export const initDb = () => {
  if (!localStorage.getItem('rchst_users')) {
    localStorage.setItem('rchst_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('rchst_submissions')) {
    localStorage.setItem('rchst_submissions', JSON.stringify(DEFAULT_SUBMISSIONS));
  }
  if (!localStorage.getItem('rchst_notifications')) {
    localStorage.setItem('rchst_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
};

// Seed DB immediately
initDb();

export const getDbUsers = (): User[] => {
  initDb();
  return JSON.parse(localStorage.getItem('rchst_users') || '[]');
};

export const getDbSubmissions = (): Submission[] => {
  initDb();
  return JSON.parse(localStorage.getItem('rchst_submissions') || '[]');
};

export const getDbNotifications = (): NotificationItem[] => {
  initDb();
  return JSON.parse(localStorage.getItem('rchst_notifications') || '[]');
};

export const saveDbUsers = (users: User[]) => {
  localStorage.setItem('rchst_users', JSON.stringify(users));
};

export const saveDbSubmissions = (subs: Submission[]) => {
  localStorage.setItem('rchst_submissions', JSON.stringify(subs));
};

export const saveDbNotifications = (notifs: NotificationItem[]) => {
  localStorage.setItem('rchst_notifications', JSON.stringify(notifs));
};
