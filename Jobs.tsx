import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, Spinner, EmptyState, SearchInput, StatusBadge, Modal } from "../../components/ui";
import type { Job } from "../../types";

export default function StudentJobs() {
  const { studentId } = useAuth();
  const [rows, setRows] = useState<(Job & { company?: { company_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Job | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select("*, company:companies(company_name)")
      .eq("status", "open")
      .order("deadline");
    if (data) setRows(data as (Job & { company?: { company_name: string } })[]);
    if (studentId) {
      const { data: apps } = await supabase.from("applications").select("job_id").eq("student_id", studentId).not("job_id", "is", null);
      if (apps) setAppliedIds(new Set(apps.map((a: { job_id: number }) => a.job_id!)));
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [studentId]);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const ms = !q || r.title.toLowerCase().includes(q) || (r.company?.company_name ?? "").toLowerCase().includes(q) || (r.required_skills ?? "").toLowerCase().includes(q);
    const mf = !skillFilter || (r.required_skills ?? "").toLowerCase().includes(skillFilter.toLowerCase());
    return ms && mf;
  });

  async function apply(jobId: number) {
    if (!studentId) return;
    const { error } = await supabase.from("applications").insert({
      student_id: studentId, job_id: jobId, status: "Applied",
    });
    if (!error) {
      setAppliedIds(new Set([...appliedIds, jobId]));
      setSelected(null);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Browse Job / Placement Opportunities" subtitle={`${rows.length} open positions available`} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title, company, skills..." />
        <input className="input" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} placeholder="Filter by skill (e.g. Java)" />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="No jobs match your search." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="card p-5 flex flex-col">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold text-slate-800">{r.title}</h3>
                <StatusBadge status={r.status} />
              </div>
              <p className="mb-1 text-sm text-slate-500">{r.company?.company_name}</p>
              <p className="mb-3 line-clamp-2 text-sm text-slate-600">{r.description ?? "No description."}</p>
              <div className="mb-4 space-y-1 text-sm text-slate-500">
                <p><span className="font-medium text-slate-600">Location:</span> {r.location ?? "—"}</p>
                <p><span className="font-medium text-slate-600">Salary:</span> {r.salary ? `₹${r.salary.toLocaleString()}` : "—"}</p>
                <p><span className="font-medium text-slate-600">Type:</span> {r.job_type ?? "—"}</p>
                <p><span className="font-medium text-slate-600">Skills:</span> {r.required_skills ?? "—"}</p>
                <p><span className="font-medium text-slate-600">Deadline:</span> {r.deadline ?? "—"}</p>
              </div>
              <div className="mt-auto">
                {appliedIds.has(r.id) ? (
                  <button className="btn-secondary w-full" disabled>Already Applied</button>
                ) : (
                  <button className="btn-primary w-full" onClick={() => setSelected(r)}>Apply Now</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Modal open={true} title="Confirm Application" onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">You are about to apply for:</p>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">{selected.title}</p>
              <p className="text-sm text-slate-500">{selected.company?.company_name}</p>
              <p className="text-sm text-slate-500">{selected.location} · {selected.salary ? `₹${selected.salary.toLocaleString()}` : "—"}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => apply(selected.id)}>Confirm & Apply</button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
