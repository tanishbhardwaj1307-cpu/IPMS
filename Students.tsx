import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { adminUserAction } from "../../lib/adminUsers";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, StatCard, Spinner, EmptyState, SearchInput, Modal, ConfirmModal } from "../../components/ui";
import type { Student, Profile } from "../../types";

export default function AdminStudents() {
  const [rows, setRows] = useState<(Student & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [editing, setEditing] = useState<Student & { profile?: Profile } | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("students")
      .select("*, profile:profiles(*)")
      .order("id");
    if (data) setRows(data as (Student & { profile?: Profile })[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.roll_number.toLowerCase().includes(q) ||
      r.branch.toLowerCase().includes(q) ||
      (r.profile?.full_name ?? "").toLowerCase().includes(q) ||
      (r.profile?.email ?? "").toLowerCase().includes(q);
    const matchBranch = !branchFilter || r.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  const branches = [...new Set(rows.map((r) => r.branch))];

  return (
    <DashboardLayout>
      <PageHeader
        title="Manage Students"
        subtitle={`${rows.length} students registered`}
        action={<button className="btn-primary" onClick={() => setCreating(true)}>+ Add Student</button>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, roll number, email, branch..." />
        <select className="input" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="No students found." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Roll No</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Sem</th>
                <th className="px-4 py-3 font-medium">CGPA</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.roll_number}</td>
                  <td className="px-4 py-3 text-slate-700">{r.profile?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{r.profile?.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{r.branch}</td>
                  <td className="px-4 py-3 text-slate-700">{r.semester}</td>
                  <td className="px-4 py-3 text-slate-700">{r.cgpa}</td>
                  <td className="px-4 py-3">
                    {r.placed ? <span className="badge bg-emerald-100 text-emerald-700">Placed</span> : <span className="badge bg-slate-100 text-slate-500">Not Placed</span>}
                  </td>
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
        <StudentFormModal
          student={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}

      <ConfirmModal
        open={deleteId !== null}
        message="Are you sure you want to delete this student? This will also remove their applications and related records."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId === null) return;
          const row = rows.find((r) => r.id === deleteId);
          if (row?.profile_id) {
            await adminUserAction({ action: "delete", profile_id: row.profile_id });
          } else {
            await supabase.from("students").delete().eq("id", deleteId);
          }
          setDeleteId(null);
          load();
        }}
      />
    </DashboardLayout>
  );
}

function StudentFormModal({
  student,
  onClose,
  onSaved,
}: {
  student: Student & { profile?: Profile } | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    full_name: student?.profile?.full_name ?? "",
    email: student?.profile?.email ?? "",
    password: "",
    phone: student?.profile?.phone ?? "",
    roll_number: student?.roll_number ?? "",
    branch: student?.branch ?? "Computer Science",
    semester: student?.semester ?? 8,
    cgpa: student?.cgpa ?? 7.5,
    skills: student?.skills ?? "",
    resume_summary: student?.resume_summary ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      if (student) {
        await adminUserAction({
          action: "update",
          profile_id: student.profile_id,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
          full_name: form.full_name,
          phone: form.phone,
          student: {
            roll_number: form.roll_number, branch: form.branch, semester: Number(form.semester),
            cgpa: Number(form.cgpa), skills: form.skills, resume_summary: form.resume_summary,
          },
        });
      } else {
        if (!form.password) throw new Error("Password is required when creating a student");
        await adminUserAction({
          action: "create", role: "student", email: form.email, password: form.password,
          full_name: form.full_name, phone: form.phone,
          student: {
            roll_number: form.roll_number, branch: form.branch, semester: Number(form.semester),
            cgpa: Number(form.cgpa), skills: form.skills, resume_summary: form.resume_summary,
          },
        });
      }
      onSaved();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  }

  return (
    <Modal open={true} title={student ? "Edit Student" : "Add Student"} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Full Name</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Password{student ? " (leave blank to keep current)" : ""}</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required={!student} /></div>
          <div><label className="label">Roll Number</label><input className="input" value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} required /></div>
          <div><label className="label">Branch</label>
            <select className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
              <option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>Mechanical</option>
            </select>
          </div>
          <div><label className="label">Semester</label><input type="number" min={1} max={8} className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} required /></div>
          <div><label className="label">CGPA</label><input type="number" step={0.01} min={0} max={10} className="input" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: Number(e.target.value) })} required /></div>
        </div>
        <div><label className="label">Skills</label><input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
        <div><label className="label">Resume Summary</label><textarea className="input" rows={2} value={form.resume_summary} onChange={(e) => setForm({ ...form, resume_summary: e.target.value })} /></div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
