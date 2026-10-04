import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, Spinner } from "../../components/ui";
import type { Student } from "../../types";

export default function StudentProfile() {
  const { profile, studentId } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ skills: "", resume_summary: "", branch: "", semester: 8, cgpa: 7.5 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .maybeSingle();
      if (data) {
        setStudent(data as Student);
        setForm({
          skills: data.skills ?? "", resume_summary: data.resume_summary ?? "",
          branch: data.branch, semester: data.semester, cgpa: data.cgpa,
        });
      }
      setLoading(false);
    })();
  }, [studentId]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    setSaving(true);
    await supabase.from("students").update({
      skills: form.skills, resume_summary: form.resume_summary,
      branch: form.branch, semester: Number(form.semester), cgpa: Number(form.cgpa),
    }).eq("id", studentId);
    const { data } = await supabase.from("students").select("*").eq("id", studentId).maybeSingle();
    if (data) setStudent(data as Student);
    setSaving(false);
    setEditing(false);
  }

  if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" subtitle="Your academic and resume information"
        action={!editing ? <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button> : undefined} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
              {profile?.full_name?.charAt(0) ?? "S"}
            </div>
            <h2 className="text-lg font-bold text-slate-800">{profile?.full_name}</h2>
            <p className="text-sm text-slate-500">{profile?.email}</p>
          </div>
          <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-700">{profile?.phone ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Roll Number</span><span className="font-medium text-slate-700">{student?.roll_number ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Placed</span><span className="font-medium text-slate-700">{student?.placed ? "Yes" : "No"}</span></div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          {editing ? (
            <form onSubmit={saveProfile} className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Edit Academic Details</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><label className="label">Branch</label>
                  <select className="input" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                    <option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>Mechanical</option>
                  </select>
                </div>
                <div><label className="label">Semester</label><input type="number" min={1} max={8} className="input" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} /></div>
                <div><label className="label">CGPA</label><input type="number" step={0.01} min={0} max={10} className="input" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: Number(e.target.value) })} /></div>
              </div>
              <div><label className="label">Skills</label><input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Python, SQL, React" /></div>
              <div><label className="label">Resume Summary</label><textarea className="input" rows={4} value={form.resume_summary} onChange={(e) => setForm({ ...form, resume_summary: e.target.value })} /></div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Academic & Resume Details</h3>
              <div className="space-y-4">
                <div><p className="text-sm text-slate-500">Branch</p><p className="font-medium text-slate-700">{student?.branch ?? "—"}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-slate-500">Semester</p><p className="font-medium text-slate-700">{student?.semester ?? "—"}</p></div>
                  <div><p className="text-sm text-slate-500">CGPA</p><p className="font-medium text-slate-700">{student?.cgpa ?? "—"}</p></div>
                </div>
                <div><p className="text-sm text-slate-500">Skills</p><p className="font-medium text-slate-700">{student?.skills ?? "—"}</p></div>
                <div><p className="text-sm text-slate-500">Resume Summary</p><p className="text-slate-700">{student?.resume_summary ?? "—"}</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
