import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, Spinner, EmptyState, Modal, ConfirmModal, StatusBadge, StatCard } from "../../components/ui";
import type { Placement, Student, Job } from "../../types";

export default function CompanyPlacements() {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<(Placement & { student?: Student; job?: Job })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Placement | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [stats, setStats] = useState({ total: 0, avgPackage: 0 });

  async function load() {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("placements")
      .select("*, student:students(*), job:jobs(*)")
      .eq("company_id", companyId)
      .order("id");
    if (data) {
      const p = data as (Placement & { student?: Student; job?: Job })[];
      setRows(p);
      const avg = p.length > 0 ? p.reduce((s, r) => s + (r.package ?? 0), 0) / p.length : 0;
      setStats({ total: p.length, avgPackage: avg });
    }
    const { data: js } = await supabase.from("jobs").select("*").eq("company_id", companyId).order("title");
    if (js) setJobs(js as Job[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [companyId]);

  async function loadStudents() {
    const { data: selectedApps } = await supabase
      .from("applications")
      .select("student:students(*)")
      .eq("status", "Selected");
    if (selectedApps) {
      const unique = new Map<number, Student>();
      selectedApps.forEach((a: { student: Student }) => {
        const s = Array.isArray(a.student) ? a.student[0] : a.student;
        if (s && !unique.has(s.id)) unique.set(s.id, s);
      });
      setStudents(Array.from(unique.values()));
    }
  }

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="Placement Records" subtitle="Students placed at your company"
        action={<button className="btn-primary" onClick={() => { loadStudents(); setCreating(true); }}>+ Add Placement</button>} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Total Placed" value={stats.total} color="emerald" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>} />
        <StatCard label="Average Package" value={`₹${(stats.avgPackage / 100000).toFixed(2)} LPA`} color="brand" icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659" /></svg>} />
      </div>

      {rows.length === 0 ? <EmptyState message="No placement records yet. Mark students as Selected from the Interviews page, then add them here." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Roll No</th>
                <th className="px-4 py-3 font-medium">Job</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Joining Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.student?.roll_number}</td>
                  <td className="px-4 py-3 text-slate-500">{r.student?.roll_number}</td>
                  <td className="px-4 py-3 text-slate-700">{r.job?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{r.package ? `₹${r.package.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{r.joining_date ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-brand-600 hover:underline" onClick={() => setEditing(r)}>Edit</button>
                      <button className="text-red-600 hover:underline" onClick={() => setDeleteId(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editing) && (
        <PlacementForm placement={editing} companyId={companyId!} students={students} jobs={jobs}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }} />
      )}

      <ConfirmModal open={deleteId !== null} message="Delete this placement record?"
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => { if (deleteId !== null) { await supabase.from("placements").delete().eq("id", deleteId); setDeleteId(null); load(); } }} />
    </DashboardLayout>
  );
}

function PlacementForm({ placement, companyId, students, jobs, onClose, onSaved }: {
  placement: Placement | null; companyId: number; students: Student[]; jobs: Job[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    student_id: placement?.student_id ?? (students[0]?.id ?? 0),
    job_id: placement?.job_id ?? (jobs[0]?.id ?? 0),
    package: placement?.package ?? 0, joining_date: placement?.joining_date ?? "",
    status: (placement?.status ?? "Placed") as "Placed" | "Offered" | "Joined",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { ...form, student_id: Number(form.student_id), company_id: companyId, job_id: form.job_id ? Number(form.job_id) : null, package: Number(form.package) };
      if (placement) {
        const { error } = await supabase.from("placements").update(payload).eq("id", placement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("placements").insert(payload);
        if (error) throw error;
        const { error: placedError } = await supabase.rpc("mark_student_placed", { p_student_id: Number(form.student_id) });
        if (placedError) throw placedError;
      }
      onSaved();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Save failed"); }
    setSaving(false);
  }

  return (
    <Modal open={true} title={placement ? "Edit Placement" : "Add Placement"} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        {students.length === 0 && <p className="text-sm text-amber-600">No selected students found. Mark students as "Selected" from the Applicants or Interviews page first.</p>}
        <div><label className="label">Student</label>
          <select className="input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: Number(e.target.value) })} required>
            {students.map((s) => <option key={s.id} value={s.id}>{s.roll_number}</option>)}
          </select>
        </div>
        <div><label className="label">Job</label>
          <select className="input" value={form.job_id} onChange={(e) => setForm({ ...form, job_id: Number(e.target.value) })}>
            <option value={0}>— None —</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Package (₹)</label><input type="number" className="input" value={form.package} onChange={(e) => setForm({ ...form, package: Number(e.target.value) })} /></div>
          <div><label className="label">Joining Date</label><input type="date" className="input" value={form.joining_date ?? ""} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} /></div>
        </div>
        <div><label className="label">Status</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "Placed" | "Offered" | "Joined" })}><option>Placed</option><option>Offered</option><option>Joined</option></select></div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
