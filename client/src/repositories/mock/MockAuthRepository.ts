import { IAuthRepository, AuthResult, RegisterResult, RegisterPayload } from '../IAuthRepository';
import { getDbUsers, saveDbUsers, getDbSubmissions, saveDbSubmissions, getDbNotifications, saveDbNotifications, User, Submission, NotificationItem } from '../../api/mockDb';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getCurrentUserFromToken(): User | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const users = getDbUsers();
  return users.find((u) => u.email === token) || null;
}

export class MockAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<AuthResult> {
    await delay(400);
    const users = getDbUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      const err: any = new Error('Invalid credentials');
      err.response = { status: 400, data: { message: 'Invalid credentials' } };
      throw err;
    }

    if (user.role === 'reviewer' && user.status === 'inactive') {
      const err: any = new Error('Account deactivated');
      err.response = { status: 403, data: { message: 'Your account has been deactivated by Super Admin' } };
      throw err;
    }

    localStorage.setItem('token', user.email);
    return { token: user.email, user };
  }

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    await delay(400);
    const { fullName, firstName, lastName, email, phone, password } = payload;
    const users = getDbUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      const err: any = new Error('Email already exists');
      err.response = { status: 400, data: { message: 'Email already registered' } };
      throw err;
    }

    const count = users.filter((u) => u.role === 'student').length + 1;
    const paddedNum = String(count).padStart(5, '0');
    const regNumber = `RCHST-2026-${paddedNum}`;

    const newStudent: User = {
      id: `u-student-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: 'student',
      regNumber,
    };

    users.push(newStudent);
    saveDbUsers(users);

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

    localStorage.setItem('token', email);

    return { token: email, user: newStudent, regNumber };
  }

  async getMe(): Promise<{ user: User }> {
    await delay(300);
    const currentUser = getCurrentUserFromToken();
    if (!currentUser) {
      const err: any = new Error('Unauthorized');
      err.response = { status: 401, data: { message: 'Unauthorized' } };
      throw err;
    }
    return { user: currentUser };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    await delay(400);
    return { message: 'If an account exists, a reset link has been sent to your email.' };
  }

  async resetPassword(_token: string, _password: string): Promise<{ message: string }> {
    await delay(400);
    return { message: 'Password reset successful' };
  }

  async changePassword(_currentPassword: string, _newPassword: string): Promise<{ message: string }> {
    await delay(400);
    return { message: 'Password changed successfully' };
  }
}
