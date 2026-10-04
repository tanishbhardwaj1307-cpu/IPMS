import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function icon(path: string) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: icon("M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z") },
    { to: "/admin/students", label: "Students", icon: icon("M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM10.5 12.75c-3.745 0-6.75 2.51-6.75 5.625v1.125h13.5v-1.125c0-3.115-3.005-5.625-6.75-5.625zM18 12.75v1.5m2.25-1.5v1.5m0 0v.75m0-.75h.75m-.75 0h-.75") },
    { to: "/admin/companies", label: "Companies", icon: icon("M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h.008v.008H9V6.75zm0 3h.008v.008H9V9.75zm0 3h.008v.008H9v-.008zm4.5-6h.008v.008H13.5V6.75zm0 3h.008v.008H13.5V9.75zm0 3h.008v.008H13.5v-.008z") },
    { to: "/admin/internships", label: "Internships", icon: icon("M20.25 14.15v4.073a2.25 2.25 0 01-2.036 2.235l-1.214.122a48.59 48.59 0 01-10.5 0l-1.214-.122A2.25 2.25 0 013.25 18.223V14.15m9 3.09v-4.5m-9 1.5h18m-9-9.75c.66 0 1.236.286 1.5.75l3.75 6.75h-10.5l3.75-6.75c.264-.464.84-.75 1.5-.75z") },
    { to: "/admin/jobs", label: "Jobs", icon: icon("M20.499 6.75a.75.75 0 01-.75.75h-7.5a.75.75 0 010-1.5h7.5a.75.75 0 01.75.75zM17.999 12a.75.75 0 01-.75.75h-5.25a.75.75 0 010-1.5h5.25a.75.75 0 01.75.75zM15.749 17.25a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75z") },
    { to: "/admin/applications", label: "Applications", icon: icon("M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z") },
    { to: "/admin/interviews", label: "Interviews", icon: icon("M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z") },
    { to: "/admin/placements", label: "Placements", icon: icon("M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007-.529-.764-3.864c-.15-.746-.795-1.282-1.555-1.282H9.815c-.76 0-1.405.536-1.555 1.282l-.764 3.864m5.007.529h-5.007") },
  ],
  student: [
    { to: "/student/dashboard", label: "Dashboard", icon: icon("M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z") },
    { to: "/student/profile", label: "My Profile", icon: icon("M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z") },
    { to: "/student/internships", label: "Internships", icon: icon("M20.25 14.15v4.073a2.25 2.25 0 01-2.036 2.235l-1.214.122a48.59 48.59 0 01-10.5 0l-1.214-.122A2.25 2.25 0 013.25 18.223V14.15m9 3.09v-4.5m-9 1.5h18m-9-9.75c.66 0 1.236.286 1.5.75l3.75 6.75h-10.5l3.75-6.75c.264-.464.84-.75 1.5-.75z") },
    { to: "/student/jobs", label: "Jobs", icon: icon("M20.499 6.75a.75.75 0 01-.75.75h-7.5a.75.75 0 010-1.5h7.5a.75.75 0 01.75.75zM17.999 12a.75.75 0 01-.75.75h-5.25a.75.75 0 010-1.5h5.25a.75.75 0 01.75.75zM15.749 17.25a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75z") },
    { to: "/student/applications", label: "Applications", icon: icon("M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z") },
    { to: "/student/interviews", label: "Interviews", icon: icon("M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z") },
  ],
  company: [
    { to: "/company/dashboard", label: "Dashboard", icon: icon("M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z") },
    { to: "/company/profile", label: "Company Profile", icon: icon("M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18") },
    { to: "/company/internships", label: "Internships", icon: icon("M20.25 14.15v4.073a2.25 2.25 0 01-2.036 2.235l-1.214.122a48.59 48.59 0 01-10.5 0l-1.214-.122A2.25 2.25 0 013.25 18.223V14.15m9 3.09v-4.5m-9 1.5h18") },
    { to: "/company/jobs", label: "Jobs", icon: icon("M20.499 6.75a.75.75 0 01-.75.75h-7.5a.75.75 0 010-1.5h7.5a.75.75 0 01.75.75z") },
    { to: "/company/applicants", label: "Applicants", icon: icon("M18 18.72a9.094 9.094 0 003.741-.349 3 3 0 00-4.682-2.72m.94 3.068l.41.41m2.59-9.42a3 3 0 00-3.87-3.87") },
    { to: "/company/interviews", label: "Interviews", icon: icon("M15 10.5a3 3 0 11-6 0 3 3 0 016 0z") },
    { to: "/company/placements", label: "Placements", icon: icon("M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871") },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  if (!profile) return null;

  const roleLabel = profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
  const items = NAV[profile.role];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">IP</div>
          <div>
            <p className="text-sm font-bold text-slate-800">IPMS</p>
            <p className="text-xs text-slate-500">{roleLabel} Panel</p>
          </div>
        </div>
        <nav className="scrollbar-thin flex-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-700">{profile.full_name}</p>
            <p className="truncate text-xs text-slate-500">{profile.email}</p>
          </div>
          <button
            onClick={async () => { await logout(); navigate("/login"); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            {icon("M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h.75M9 15h9m0 0l-2.25-2.25M18 15l-2.25 2.25")}
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => {
                const aside = document.querySelector("aside");
                aside?.classList.toggle("-translate-x-full");
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-slate-600">Internship &amp; Placement Management System</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-700">{profile.full_name}</p>
              <p className="text-xs text-slate-500">{roleLabel}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
