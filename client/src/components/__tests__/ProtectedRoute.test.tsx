import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderWithRouter = (ui: React.ReactElement, { initialEntries = ['/'] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={ui} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/student" element={<div>Student Dashboard</div>} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Loading Portal...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when user has the correct role', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'student' }, loading: false });
    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to student dashboard when user role does not match', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'student' }, loading: false });
    renderWithRouter(
      <ProtectedRoute allowedRoles={['reviewer', 'super_admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
  });

  it('redirects to admin dashboard when reviewer tries student route', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'reviewer' }, loading: false });
    renderWithRouter(
      <ProtectedRoute allowedRoles={['student']}>
        <div>Student Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('renders children when allowedRoles is undefined', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'student' }, loading: false });
    renderWithRouter(
      <ProtectedRoute>
        <div>Public Protected Content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('Public Protected Content')).toBeInTheDocument();
  });
});
