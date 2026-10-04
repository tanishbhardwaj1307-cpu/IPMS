import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { StatCard, Spinner, PageHeader, StatusBadge } from "../../components/ui";
import type { Application, Placement } from "../../types";

export default function StudentDashboard() {
  const { profile, studentId } = useAuth();
  const [stats, setStats] = useState({ internships: 0, jobs: 0, applied: 0, shortlisted: 0, selected: 0, placed: false });
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    (async () => {
      const [i, j, a] = await Promise.all([
        supabase.from("internships").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("applications").select("*, internship:internships(*), job:jobs(*)").eq("student_id", studentId).order("applied_at", { ascending: false }),
      ]);
      const apps = (a.data ?? []) as Application[];
      setStats({
        internships: i.count ?? 0,
        jobs: j.count ?? 0,
        applied: apps.length,
        shortlisted: apps.filter((x) => x.status === "Shortlisted" || x.status === "Interview Scheduled").length,
        selected: apps.filter((x) => x.status === "Selected").length,
        placed: false,
      });
      setRecentApps(apps.slice(0, 5));
      const { data: pl } = await supabase
        .from("placements")
        .select("*, company:companies(*), job:jobs(*)")
        .eq("student_id", studentId)
        .maybeSingle();
      if (pl) {
        setPlacement(pl as Placement);
        setStats((s) => ({ ...s, placed: true }));
      }
      setLoading(false);
    })();
  }, [studentId]);

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title={`Welcome, ${profile?.full_name}`} subtitle="Your placement journey at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Available Internships" value={stats.internships} color="amber" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.036 2.235" /></svg>} />
        <StatCard label="Available Jobs" value={stats.jobs} color="sky" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.499 6.75a.75.75 0 01-.75.75h-7.5a.75.75 0 010-1.5h7.5a.75.75 0 01.75.75z" /></svg>} />
        <StatCard label="Applications Submitted" value={stats.applied} color="brand" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586" /></svg>} />
        <StatCard label="Shortlisted" value={stats.shortlisted} color="violet" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>} />
        <StatCard label="Selected" value={stats.selected} color="emerald" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>} />
        <StatCard label="Placement Status" value={stats.placed ? "Placed" : "Not Placed"} color={stats.placed ? "rose" : "brand"} icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3" /></svg>} />
      </div>

      {placement && (
        <div className="mt-6 card p-6 border-l-4 border-emerald-500">
          <h3 className="mb-3 text-lg font-semibold text-slate-800">Placement Details</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-sm text-slate-500">Company</p><p className="font-semibold text-slate-700">{placement.company?.company_name}</p></div>
            <div><p className="text-sm text-slate-500">Job</p><p className="font-semibold text-slate-700">{placement.job?.title ?? "—"}</p></div>
            <div><p className="text-sm text-slate-500">Package</p><p className="font-semibold text-slate-700">{placement.package ? `₹${placement.package.toLocaleString()}` : "—"}</p></div>
            <div><p className="text-sm text-slate-500">Joining Date</p><p className="font-semibold text-slate-700">{placement.joining_date ?? "—"}</p></div>
          </div>
        </div>
      )}

      <div className="mt-6 card p-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">Recent Applications</h3>
        {recentApps.length === 0 ? (
          <p className="text-sm text-slate-500">You haven't applied to any opportunities yet. Browse internships and jobs to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 text-left text-slate-500">
                <tr>
                  <th className="pb-2 font-medium">Opportunity</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Applied On</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-2.5 font-medium text-slate-700">{a.internship?.title ?? a.job?.title}</td>
                    <td className="py-2.5"><span className="badge bg-slate-100 text-slate-600">{a.internship_id ? "Internship" : "Job"}</span></td>
                    <td className="py-2.5 text-slate-500">{new Date(a.applied_at).toLocaleDateString()}</td>
                    <td className="py-2.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
