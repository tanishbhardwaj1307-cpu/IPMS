import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">IP</div>
          <span className="text-lg font-bold text-slate-800">IPMS</span>
        </div>
        <div className="flex items-center gap-3">
          {profile ? (
            <Link to={`/${profile.role}/dashboard`} className="btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 text-center lg:px-12">
        <div className="mx-auto mb-6 inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
          DBMS Thematic Assessment Project
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Internship &amp; Placement Management System
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          A complete platform connecting students, companies, and the placement cell.
          Manage internships, track applications, schedule interviews, and record placements — all in one place.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/login" className="btn-primary px-6 py-3 text-base">Get Started</Link>
          <Link to="/register" className="btn-secondary px-6 py-3 text-base">Create Account</Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24 lg:px-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Student Management", desc: "Register students, track academic details, skills, and placement status.", icon: "M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0z" },
            { title: "Company Portal", desc: "Companies post internships and jobs, review applicants, and schedule interviews.", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18" },
            { title: "Application Tracking", desc: "Full lifecycle from Applied to Selected/Rejected with status badges.", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" },
            { title: "Interview Scheduling", desc: "Schedule online or offline interviews and record results per round.", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" },
            { title: "Placement Records", desc: "Maintain final placement data with package, joining date, and status.", icon: "M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3" },
            { title: "Admin Dashboard", desc: "Comprehensive statistics and full CRUD control over every entity.", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25" },
          ].map((f) => (
            <div key={f.title} className="card p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo account hint */}
      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-12">
        <div className="card p-6 text-center">
          <h3 className="mb-3 text-lg font-bold text-slate-800">Demo Account Emails</h3>
          <p className="mb-4 text-sm text-slate-500">Passwords are selected during the secure Supabase Auth bootstrap and are never embedded in the website.</p>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-700">Admin</p>
              <p className="text-slate-500">admin@ipms.edu</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-700">Student</p>
              <p className="text-slate-500">student01@ipms.edu</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-700">Company</p>
              <p className="text-slate-500">hr@techvision.in</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Internship &amp; Placement Management System — DBMS Academic Project
      </footer>
    </div>
  );
}
