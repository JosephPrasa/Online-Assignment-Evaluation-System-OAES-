import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';

import ManageUsers from './pages/admin/ManageUsers';
import ManageSubjects from './pages/admin/ManageSubjects';
import Reports from './pages/admin/Reports';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import CreateAssignment from './pages/faculty/CreateAssignment';
import MyAssignments from './pages/faculty/MyAssignments';
import ViewSubmissions from './pages/faculty/ViewSubmissions';
import EvaluateSubmission from './pages/faculty/EvaluateSubmission';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAssignments from './pages/student/StudentAssignments';
import SubmitAssignment from './pages/student/SubmitAssignment';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

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

            <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default AppRoutes;
