import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { adminUserAction } from "../../lib/adminUsers";
import { DashboardLayout } from "../../components/DashboardLayout";
import { PageHeader, Spinner, EmptyState, SearchInput, Modal, ConfirmModal } from "../../components/ui";
import type { Company, Profile } from "../../types";

export default function AdminCompanies() {
  const [rows, setRows] = useState<(Company & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<(Company & { profile?: Profile }) | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("companies").select("*, profile:profiles(*)").order("id");
    if (data) setRows(data as (Company & { profile?: Profile })[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.company_name.toLowerCase().includes(q) || (r.industry ?? "").toLowerCase().includes(q) || (r.location ?? "").toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <PageHeader title="Manage Companies" subtitle={`${rows.length} companies registered`}
        action={<button className="btn-primary" onClick={() => setCreating(true)}>+ Add Company</button>} />

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search by name, industry, location..." /></div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="No companies found." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{r.company_name}</h3>
                  <p className="text-sm text-slate-500">{r.industry ?? "—"}</p>
                </div>
                <span className="badge bg-emerald-100 text-emerald-700">Active</span>
              </div>
              <p className="mb-3 line-clamp-2 text-sm text-slate-600">{r.description ?? "No description."}</p>
              <div className="mb-3 space-y-1 text-sm text-slate-500">
                <p><span className="font-medium text-slate-600">Location:</span> {r.location ?? "—"}</p>
                <p><span className="font-medium text-slate-600">Contact:</span> {r.profile?.email ?? "—"}</p>
              </div>
              <div className="flex gap-3 border-t border-slate-100 pt-3 text-sm">
                <button className="text-brand-600 hover:underline" onClick={() => setEditing(r)}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => setDeleteId(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <CompanyFormModal company={editing} onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }} />
      )}

      <ConfirmModal open={deleteId !== null}
        message="Delete this company? This will also remove their internships, jobs, and related applications."
        onCancel={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId === null) return;
          const row = rows.find((r) => r.id === deleteId);
          if (row?.profile_id) {
            await adminUserAction({ action: "delete", profile_id: row.profile_id });
          } else {
            await supabase.from("companies").delete().eq("id", deleteId);
          }
          setDeleteId(null); load();
        }} />
    </DashboardLayout>
  );
}

function CompanyFormModal({ company, onClose, onSaved }: { company: (Company & { profile?: Profile }) | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    company_name: company?.company_name ?? "", industry: company?.industry ?? "",
    website: company?.website ?? "", description: company?.description ?? "",
    location: company?.location ?? "", full_name: company?.profile?.full_name ?? "",
    email: company?.profile?.email ?? "", password: "",
    phone: company?.profile?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (company) {
        await adminUserAction({
          action: "update", profile_id: company.profile_id, email: form.email,
          ...(form.password ? { password: form.password } : {}),
          full_name: form.full_name, phone: form.phone,
          company: { company_name: form.company_name, industry: form.industry, website: form.website, description: form.description, location: form.location },
        });
      } else {
        if (!form.password) throw new Error("Password is required when creating a company");
        await adminUserAction({
          action: "create", role: "company", email: form.email, password: form.password,
          full_name: form.full_name, phone: form.phone,
          company: { company_name: form.company_name, industry: form.industry, website: form.website, description: form.description, location: form.location },
        });
      }
      onSaved();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Save failed"); }
    setSaving(false);
  }

  return (
    <Modal open={true} title={company ? "Edit Company" : "Add Company"} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Company Name</label><input className="input" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required /></div>
          <div><label className="label">Industry</label><input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
          <div><label className="label">Website</label><input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
          <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="label">Contact Name</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">Password{company ? " (leave blank to keep current)" : ""}</label><input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required={!company} /></div>
        </div>
        <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </Modal>
  );
}
