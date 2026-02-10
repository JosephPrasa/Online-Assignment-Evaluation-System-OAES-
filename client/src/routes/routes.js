import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Lazy load pages
const Login = lazy(() => import('../pages/auth/Login'));
const LoginSuccess = lazy(() => import('../pages/auth/LoginSuccess'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));
const ManageSubjects = lazy(() => import('../pages/admin/ManageSubjects'));
const Reports = lazy(() => import('../pages/admin/Reports'));
const FacultyDashboard = lazy(() => import('../pages/faculty/FacultyDashboard'));
const CreateAssignment = lazy(() => import('../pages/faculty/CreateAssignment'));
const MyAssignments = lazy(() => import('../pages/faculty/MyAssignments'));
const ViewSubmissions = lazy(() => import('../pages/faculty/ViewSubmissions'));
const EvaluateSubmission = lazy(() => import('../pages/faculty/EvaluateSubmission'));
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const StudentAssignments = lazy(() => import('../pages/student/StudentAssignments'));
const SubmitAssignment = lazy(() => import('../pages/student/SubmitAssignment'));
const Landing = lazy(() => import('../pages/Landing'));


const LoadingFallback = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login-success" element={<LoginSuccess />} />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <ManageUsers />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/subjects"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <ManageSubjects />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Reports />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/faculty/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['faculty']}>
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/faculty/create-assignment"
                    element={
                        <ProtectedRoute allowedRoles={['faculty']}>
                            <CreateAssignment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/faculty/assignments"
                    element={
                        <ProtectedRoute allowedRoles={['faculty']}>
                            <MyAssignments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/faculty/submissions/:id"
                    element={
                        <ProtectedRoute allowedRoles={['faculty']}>
                            <ViewSubmissions />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/faculty/evaluate/:id"
                    element={
                        <ProtectedRoute allowedRoles={['faculty']}>
                            <EvaluateSubmission />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/assignments"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentAssignments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/submit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <SubmitAssignment />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;

