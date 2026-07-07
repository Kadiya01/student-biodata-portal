import axios from 'axios';
import {
  getDbUsers,
  getDbSubmissions,
  getDbNotifications,
  saveDbUsers,
  saveDbSubmissions,
  saveDbNotifications,
  User,
  Submission,
  NotificationItem,
  StudentBiodata,
} from './mockDb';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api/v1'
});

// Helper for fake latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retrieve user from token (in mock, token is user's email)
const getCurrentUserFromToken = (): User | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const users = getDbUsers();
  return users.find((u) => u.email === token) || null;
};

// Override axios methods to mock API responses locally
api.get = async function (url: string, config?: any): Promise<any> {
  await delay(400); // Simulate network latency

  const currentUser = getCurrentUserFromToken();
  if (!currentUser && !url.includes('/auth/login') && !url.includes('/auth/register')) {
    const err = new Error('Unauthorized') as any;
    err.response = { status: 401, data: { message: 'Unauthorized' } };
    throw err;
  }

  // Route: /auth/me
  if (url === '/auth/me') {
    return { data: { user: currentUser } };
  }

  // Route: /student/biodata
  if (url === '/student/biodata') {
    if (currentUser?.role !== 'student') {
      const err = new Error('Forbidden') as any;
      err.response = { status: 403, data: { message: 'Forbidden' } };
      throw err;
    }
    const submissions = getDbSubmissions();
    const submission = submissions.find((s) => s.studentId === currentUser.id);
    
    return {
      data: {
        biodata: submission ? submission.biodata : null,
        submission: submission || null
      }
    };
  }

  // Route: /reviewer/submissions
  if (url === '/reviewer/submissions') {
    const submissions = getDbSubmissions();
    return { data: { submissions } };
  }

  // Route: /reviewer/submissions/:id
  if (url.startsWith('/reviewer/submissions/')) {
    const id = url.split('/').pop();
    const submissions = getDbSubmissions();
    const sub = submissions.find((s) => s.id === id);
    if (!sub) {
      const err = new Error('Not Found') as any;
      err.response = { status: 404, data: { message: 'Submission not found' } };
      throw err;
    }
    return { data: { submission: sub } };
  }

  // Route: /admin/reviewers
  if (url === '/admin/reviewers') {
    const users = getDbUsers();
    const reviewers = users.filter((u) => u.role === 'reviewer');
    return { data: { reviewers } };
  }

  // Route: /admin/notifications
  if (url === '/admin/notifications') {
    const notifications = getDbNotifications();
    return { data: { notifications } };
  }

  // Fallback to real axios if route not mocked
  return axios.prototype.get.call(api, url, config);
} as any;

api.post = async function (url: string, data?: any, config?: any): Promise<any> {
  await delay(500); // Simulate network latency

  // Route: /auth/login
  if (url === '/auth/login') {
    const { email, password } = data;
    const users = getDbUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const err = new Error('Invalid email or password') as any;
      err.response = { status: 400, data: { message: 'Invalid credentials' } };
      throw err;
    }

    if (user.role === 'reviewer' && user.status === 'inactive') {
      const err = new Error('Account deactivated') as any;
      err.response = { status: 403, data: { message: 'Your account has been deactivated by Super Admin' } };
      throw err;
    }

    // Set token as email
    localStorage.setItem('token', user.email);
    return { data: { token: user.email, user } };
  }

  // Route: /auth/register
  if (url === '/auth/register') {
    const { fullName, firstName: fName, lastName: lName, email, phone, password } = data;
    const users = getDbUsers();
    
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const err = new Error('Email already exists') as any;
      err.response = { status: 400, data: { message: 'Email already registered' } };
      throw err;
    }

    // Generate unique registration number
    const count = users.filter((u) => u.role === 'student').length + 1;
    const paddedNum = String(count).padStart(5, '0');
    const regNumber = `RCHST-2026-${paddedNum}`;

    // Use provided firstName/lastName or split fullName
    const firstName = fName || (fullName ? fullName.trim().split(' ')[0] : '');
    const lastName = lName || (fullName ? fullName.trim().split(' ').slice(1).join(' ') : '');

    const newStudent: User = {
      id: `u-student-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: 'student',
      regNumber,
    };

    // Save user
    users.push(newStudent);
    saveDbUsers(users);

    // Create a draft submission record
    const submissions = getDbSubmissions();
    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      studentId: newStudent.id,
      regNumber,
      fullName,
      email,
      programme: 'General Health Studies',
      submissionDate: new Date().toISOString(),
      status: 'Draft',
      biodata: {
        passportPhoto: '',
        fullName,
        dob: '',
        gender: '',
        email,
        phone,
        address: '',
        primarySchool: '',
        secondarySchool: '',
        ssceType: '',
        ssceSubjects: [
          { subject: 'English Language', grade: '' },
          { subject: 'Mathematics', grade: '' }
        ],
        creditsCount: 0,
        isEligible: false,
        guardianName: '',
        guardianAddress: '',
        guardianPhone: '',
        guardianRelationship: '',
      }
    };
    submissions.push(newSubmission);
    saveDbSubmissions(submissions);

    // Add alert notification for Admin
    const notifications = getDbNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Student Registered',
      message: `Name: ${fullName} | Registration Number: ${regNumber}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNotif);
    saveDbNotifications(notifications);

    // Automatically set token
    localStorage.setItem('token', email);

    return {
      data: {
        token: email,
        user: newStudent,
        regNumber,
      }
    };
  }

  const currentUser = getCurrentUserFromToken();
  if (!currentUser) {
    const err = new Error('Unauthorized') as any;
    err.response = { status: 401, data: { message: 'Unauthorized' } };
    throw err;
  }

  // Route: /student/biodata (Save/Submit)
  if (url === '/student/biodata') {
    const { biodata, action } = data;
    const submissions = getDbSubmissions();
    const subIndex = submissions.findIndex((s) => s.studentId === currentUser.id);

    if (subIndex === -1) {
      const err = new Error('Submission not found') as any;
      err.response = { status: 404, data: { message: 'Draft not found' } };
      throw err;
    }

    const currentSub = submissions[subIndex];
    const isSubmitting = action === 'submit';
    
    const updatedSub: Submission = {
      ...currentSub,
      submissionDate: new Date().toISOString(),
      status: isSubmitting ? 'Submitted' : 'Draft',
      biodata: {
        ...biodata,
        lastUpdated: new Date().toISOString()
      }
    };

    submissions[subIndex] = updatedSub;
    saveDbSubmissions(submissions);

    if (isSubmitting) {
      // Add notification for admin/reviewer
      const notifications = getDbNotifications();
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'New Biodata Submitted',
        message: `${updatedSub.fullName} (${updatedSub.regNumber}) submitted their biodata for review.`,
        timestamp: new Date().toISOString(),
        read: false
      });
      saveDbNotifications(notifications);
    }

    return { data: { submission: updatedSub } };
  }

  // Route: /reviewer/submissions/:id/review
  if (url.startsWith('/reviewer/submissions/') && url.endsWith('/review')) {
    const id = url.split('/')[3];
    const { status, reviewerComments } = data;
    const submissions = getDbSubmissions();
    const subIndex = submissions.findIndex((s) => s.id === id);

    if (subIndex === -1) {
      const err = new Error('Submission not found') as any;
      err.response = { status: 404, data: { message: 'Submission not found' } };
      throw err;
    }

    const currentSub = submissions[subIndex];
    const updatedSub: Submission = {
      ...currentSub,
      status: status,
      reviewerComments: reviewerComments || ''
    };

    submissions[subIndex] = updatedSub;
    saveDbSubmissions(submissions);

    // Create notification
    const notifications = getDbNotifications();
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Submission ${status}`,
      message: `Biodata for ${updatedSub.fullName} (${updatedSub.regNumber}) was ${status.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      read: false
    });
    saveDbNotifications(notifications);

    return { data: { submission: updatedSub } };
  }

  // Route: /admin/reviewers
  if (url === '/admin/reviewers') {
    const { firstName, lastName, email, password } = data;
    const users = getDbUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const err = new Error('Reviewer already exists') as any;
      err.response = { status: 400, data: { message: 'Reviewer email already exists' } };
      throw err;
    }

    const newReviewer: User = {
      id: `u-reviewer-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: 'reviewer',
      status: 'active'
    };

    users.push(newReviewer);
    saveDbUsers(users);

    return { data: { reviewer: newReviewer } };
  }

  // Route: /admin/reviewers/:id/toggle
  if (url.startsWith('/admin/reviewers/') && url.endsWith('/toggle')) {
    const id = url.split('/')[3];
    const users = getDbUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      const err = new Error('Reviewer not found') as any;
      err.response = { status: 404, data: { message: 'Reviewer not found' } };
      throw err;
    }

    const reviewer = users[userIndex];
    reviewer.status = reviewer.status === 'active' ? 'inactive' : 'active';
    users[userIndex] = reviewer;
    saveDbUsers(users);

    return { data: { reviewer } };
  }

  // Route: /admin/notifications/:id/read
  if (url.startsWith('/admin/notifications/') && url.endsWith('/read')) {
    const id = url.split('/')[3];
    const notifications = getDbNotifications();
    const index = notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      saveDbNotifications(notifications);
    }
    return { data: { success: true } };
  }

  return axios.prototype.post.call(api, url, data, config);
} as any;

api.put = async function (url: string, data?: any, config?: any): Promise<any> {
  await delay(400);

  // Route: /admin/reviewers/:id
  if (url.startsWith('/admin/reviewers/')) {
    const id = url.split('/').pop();
    const { firstName, lastName, email } = data;
    const users = getDbUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      const err = new Error('Reviewer not found') as any;
      err.response = { status: 404, data: { message: 'Reviewer not found' } };
      throw err;
    }

    const updatedUser = {
      ...users[userIndex],
      firstName,
      lastName,
      email
    };

    users[userIndex] = updatedUser;
    saveDbUsers(users);

    return { data: { reviewer: updatedUser } };
  }

  return axios.prototype.put.call(api, url, data, config);
} as any;

export default api;
