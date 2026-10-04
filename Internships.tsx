import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, Spinner, EmptyState, SearchInput, StatusBadge, Modal } from "../../components/ui";
import type { Internship } from "../../types";

export default function StudentInternships() {
  const { studentId } = useAuth();
  const [rows, setRows] = useState<(Internship & { company?: { company_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Internship | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("internships")
      .select("*, company:companies(company_name)")
      .eq("status", "open")
      .order("deadline");
    if (data) setRows(data as (Internship & { company?: { company_name: string } })[]);
    if (studentId) {
      const { data: apps } = await supabase.from("applications").select("internship_id").eq("student_id", studentId).not("internship_id", "is", null);
      if (apps) setAppliedIds(new Set(apps.map((a: { internship_id: number }) => a.internship_id!)));
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

  async function apply(internshipId: number) {
    if (!studentId) return;
    const { error } = await supabase.from("applications").insert({
      student_id: studentId, internship_id: internshipId, status: "Applied",
    });
    if (!error) {
      setAppliedIds(new Set([...appliedIds, internshipId]));
      setSelected(null);
    }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Browse Internships" subtitle={`${rows.length} open internships available`} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title, company, skills..." />
        <input className="input" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} placeholder="Filter by skill (e.g. Python)" />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="No internships match your search." /> : (
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
                <p><span className="font-medium text-slate-600">Duration:</span> {r.duration ?? "—"}</p>
                <p><span className="font-medium text-slate-600">Stipend:</span> {r.stipend ? `₹${r.stipend.toLocaleString()}` : "—"}</p>
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
              <p className="text-sm text-slate-500">{selected.location}</p>
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
