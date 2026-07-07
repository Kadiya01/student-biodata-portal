import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminLogin from '../pages/AdminLogin';
import StudentDashboard from '../pages/StudentDashboard';
import BiodataWizard from '../pages/BiodataWizard';
import SubmissionStatus from '../pages/SubmissionStatus';
import AdminDashboard from '../pages/AdminDashboard';
import ErrorBoundary from '../components/ErrorBoundary';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />

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
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  );
}
