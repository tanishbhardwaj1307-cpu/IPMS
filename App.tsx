import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Spinner } from "./components/ui";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminCompanies from "./pages/admin/Companies";
import AdminInternships from "./pages/admin/Internships";
import AdminJobs from "./pages/admin/Jobs";
import AdminApplications from "./pages/admin/Applications";
import AdminInterviews from "./pages/admin/Interviews";
import AdminPlacements from "./pages/admin/Placements";

// Student
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentInternships from "./pages/student/Internships";
import StudentJobs from "./pages/student/Jobs";
import StudentApplications from "./pages/student/Applications";
import StudentInterviews from "./pages/student/Interviews";

// Company
import CompanyDashboard from "./pages/company/Dashboard";
import CompanyProfile from "./pages/company/Profile";
import CompanyInternships from "./pages/company/Internships";
import CompanyJobs from "./pages/company/Jobs";
import CompanyApplicants from "./pages/company/Applicants";
import CompanyInterviews from "./pages/company/Interviews";
import CompanyPlacements from "./pages/company/Placements";

function Protected({ role, children }: { role: string; children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role !== role) return <Navigate to={`/${profile.role}/dashboard`} replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<Protected role="admin"><AdminDashboard /></Protected>} />
      <Route path="/admin/students" element={<Protected role="admin"><AdminStudents /></Protected>} />
      <Route path="/admin/companies" element={<Protected role="admin"><AdminCompanies /></Protected>} />
      <Route path="/admin/internships" element={<Protected role="admin"><AdminInternships /></Protected>} />
      <Route path="/admin/jobs" element={<Protected role="admin"><AdminJobs /></Protected>} />
      <Route path="/admin/applications" element={<Protected role="admin"><AdminApplications /></Protected>} />
      <Route path="/admin/interviews" element={<Protected role="admin"><AdminInterviews /></Protected>} />
      <Route path="/admin/placements" element={<Protected role="admin"><AdminPlacements /></Protected>} />

      {/* Student */}
      <Route path="/student/dashboard" element={<Protected role="student"><StudentDashboard /></Protected>} />
      <Route path="/student/profile" element={<Protected role="student"><StudentProfile /></Protected>} />
      <Route path="/student/internships" element={<Protected role="student"><StudentInternships /></Protected>} />
      <Route path="/student/jobs" element={<Protected role="student"><StudentJobs /></Protected>} />
      <Route path="/student/applications" element={<Protected role="student"><StudentApplications /></Protected>} />
      <Route path="/student/interviews" element={<Protected role="student"><StudentInterviews /></Protected>} />

      {/* Company */}
      <Route path="/company/dashboard" element={<Protected role="company"><CompanyDashboard /></Protected>} />
      <Route path="/company/profile" element={<Protected role="company"><CompanyProfile /></Protected>} />
      <Route path="/company/internships" element={<Protected role="company"><CompanyInternships /></Protected>} />
      <Route path="/company/jobs" element={<Protected role="company"><CompanyJobs /></Protected>} />
      <Route path="/company/applicants" element={<Protected role="company"><CompanyApplicants /></Protected>} />
      <Route path="/company/interviews" element={<Protected role="company"><CompanyInterviews /></Protected>} />
      <Route path="/company/placements" element={<Protected role="company"><CompanyPlacements /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
