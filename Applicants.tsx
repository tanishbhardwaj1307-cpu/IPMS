import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, Spinner, EmptyState, SearchInput, StatusBadge, Modal } from "../../components/ui";
import type { Application, ApplicationStatus, Student } from "../../types";

const STATUSES: ApplicationStatus[] = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"];

export default function CompanyApplicants() {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  async function load() {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    const { data: myInternships } = await supabase.from("internships").select("id").eq("company_id", companyId);
    const { data: myJobs } = await supabase.from("jobs").select("id").eq("company_id", companyId);
    const intIds = (myInternships ?? []).map((r: { id: number }) => r.id);
    const jobIds = (myJobs ?? []).map((r: { id: number }) => r.id);
    if (intIds.length === 0 && jobIds.length === 0) { setRows([]); setLoading(false); return; }
    let q = supabase.from("applications").select("*, student:students(*, profile:profiles(*)), internship:internships(*), job:jobs(*)");
    if (intIds.length > 0 && jobIds.length > 0) {
      q = q.or(`internship_id.in.(${intIds.join(",")}),job_id.in.(${jobIds.join(",")})`);
    } else if (intIds.length > 0) {
      q = q.in("internship_id", intIds);
    } else {
      q = q.in("job_id", jobIds);
    }
    const { data } = await q.order("applied_at", { ascending: false });
    if (data) setRows(data as Application[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [companyId]);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const name = r.student?.profile?.full_name ?? "";
    const roll = r.student?.roll_number ?? "";
    const title = r.internship?.title ?? r.job?.title ?? "";
    const ms = !q || name.toLowerCase().includes(q) || roll.toLowerCase().includes(q) || title.toLowerCase().includes(q);
    const mf = !statusFilter || r.status === statusFilter;
    return ms && mf;
  });

  async function updateStatus(id: number, status: ApplicationStatus) {
    await supabase.from("applications").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  async function scheduleInterview(app: Application) {
    const today = new Date();
    const date = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    await supabase.from("interviews").insert({
      application_id: app.id, interview_date: date, interview_time: "10:00",
      mode: "Online", rounds: "Technical", result: "Pending",
    });
    await supabase.from("applications").update({ status: "Interview Scheduled", updated_at: new Date().toISOString() }).eq("id", app.id);
    load();
  }

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Applicants" subtitle={`${rows.length} applications received`} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by student, roll no, opportunity..." />
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState message="No applications received yet." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Roll No</th>
                <th className="px-4 py-3 font-medium">CGPA</th>
                <th className="px-4 py-3 font-medium">Opportunity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    <button className="text-brand-600 hover:underline" onClick={() => setViewStudent(r.student ?? null)}>
                      {r.student?.profile?.full_name ?? "—"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.student?.roll_number ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{r.student?.cgpa ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{r.internship?.title ?? r.job?.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <select className="input !py-1 !text-xs w-auto" value={r.status} onChange={(e) => updateStatus(r.id, e.target.value as ApplicationStatus)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {r.status === "Shortlisted" && (
                        <button className="btn-secondary !py-1 !px-2 !text-xs" onClick={() => scheduleInterview(r)}>Schedule Interview</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewStudent && (
        <Modal open={true} title="Student Profile" onClose={() => setViewStudent(null)}>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
                {(viewStudent.profile?.full_name ?? "S").charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewStudent.profile?.full_name}</h3>
                <p className="text-sm text-slate-500">{viewStudent.profile?.email}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><p className="text-slate-500">Roll Number</p><p className="font-medium text-slate-700">{viewStudent.roll_number}</p></div>
              <div><p className="text-slate-500">Branch</p><p className="font-medium text-slate-700">{viewStudent.branch}</p></div>
              <div><p className="text-slate-500">Semester</p><p className="font-medium text-slate-700">{viewStudent.semester}</p></div>
              <div><p className="text-slate-500">CGPA</p><p className="font-medium text-slate-700">{viewStudent.cgpa}</p></div>
              <div><p className="text-slate-500">Phone</p><p className="font-medium text-slate-700">{viewStudent.profile?.phone ?? "—"}</p></div>
              <div><p className="text-slate-500">Placed</p><p className="font-medium text-slate-700">{viewStudent.placed ? "Yes" : "No"}</p></div>
            </div>
            <div><p className="text-sm text-slate-500">Skills</p><p className="text-slate-700">{viewStudent.skills ?? "—"}</p></div>
            <div><p className="text-sm text-slate-500">Resume Summary</p><p className="text-slate-700">{viewStudent.resume_summary ?? "—"}</p></div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
