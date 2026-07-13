import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { Skeleton } from '../components/ui/Skeleton';

const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const StudentDashboard = lazy(() => import('../pages/StudentDashboard'));
const BiodataWizard = lazy(() => import('../pages/BiodataWizard'));
const SubmissionStatus = lazy(() => import('../pages/SubmissionStatus'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const ChangePassword = lazy(() => import('../pages/ChangePassword'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/biodata"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <BiodataWizard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/status"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <SubmissionStatus />
              </ProtectedRoute>
            }
          />

          {/* Protected Shared Routes */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={['student', 'reviewer', 'super_admin']}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Protected Administrative Routes (Reviewers & Super Admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['reviewer', 'super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}
