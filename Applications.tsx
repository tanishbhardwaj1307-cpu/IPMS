import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, Spinner, EmptyState, SearchInput, StatusBadge } from "../../components/ui";
import type { Application, ApplicationStatus } from "../../types";

const STATUSES: ApplicationStatus[] = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"];

export default function StudentApplications() {
  const { studentId } = useAuth();
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select("*, internship:internships(*, company:companies(*)), job:jobs(*, company:companies(*))")
      .eq("student_id", studentId)
      .order("applied_at", { ascending: false });
    if (data) setRows(data as Application[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [studentId]);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const title = r.internship?.title ?? r.job?.title ?? "";
    const company = r.internship?.company?.company_name ?? r.job?.company?.company_name ?? "";
    const ms = !q || title.toLowerCase().includes(q) || company.toLowerCase().includes(q);
    const mf = !statusFilter || r.status === statusFilter;
    return ms && mf;
  });

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="My Applications" subtitle={`${rows.length} applications submitted`} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title, company..." />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState message="No applications found. Browse internships and jobs to apply!" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Opportunity</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Applied On</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.internship?.title ?? r.job?.title}</td>
                  <td className="px-4 py-3 text-slate-700">{r.internship?.company?.company_name ?? r.job?.company?.company_name}</td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{r.internship_id ? "Internship" : "Job"}</span></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.applied_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
