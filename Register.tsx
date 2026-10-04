import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Exclude<Role, "admin">>("student");
  const [form, setForm] = useState({
    email: "", password: "", fullName: "", phone: "",
    rollNumber: "", branch: "Computer Science", semester: 8, cgpa: 7.5,
    skills: "", resumeSummary: "",
    companyName: "", industry: "", website: "", description: "", location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await register({
      email: form.email.trim(),
      password: form.password,
      role,
      fullName: form.fullName,
      phone: form.phone,
      rollNumber: form.rollNumber,
      branch: form.branch,
      semester: Number(form.semester),
      cgpa: Number(form.cgpa),
      skills: form.skills,
      resumeSummary: form.resumeSummary,
      companyName: form.companyName,
      industry: form.industry,
      website: form.website,
      description: form.description,
      location: form.location,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Registration failed");
      return;
    }
    if (res.error) {
      setError(res.error);
      return;
    }
    navigate(`/${role}/dashboard`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">IP</div>
          <span className="text-xl font-bold text-slate-800">IPMS</span>
        </Link>
        <div className="card p-8">
          <h1 className="mb-1 text-2xl font-bold text-slate-800">Create an account</h1>
          <p className="mb-6 text-sm text-slate-500">Register as a student or company to get started.</p>

          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {/* Role selector */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            {(["student", "company"] as Exclude<Role, "admin">[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  role === r ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r === "student" ? "Student" : "Company / Recruiter"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" value={form.password} onChange={(e) => set("password", e.target.value)} minLength={6} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
              </div>
            </div>

            {role === "student" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Roll Number</label>
                  <input className="input" value={form.rollNumber} onChange={(e) => set("rollNumber", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Branch</label>
                  <select className="input" value={form.branch} onChange={(e) => set("branch", e.target.value)}>
                    <option>Computer Science</option>
                    <option>Information Technology</option>
                    <option>Electronics</option>
                    <option>Mechanical</option>
                  </select>
                </div>
                <div>
                  <label className="label">Semester</label>
                  <input type="number" min={1} max={8} className="input" value={form.semester} onChange={(e) => set("semester", Number(e.target.value))} required />
                </div>
                <div>
                  <label className="label">CGPA</label>
                  <input type="number" step={0.01} min={0} max={10} className="input" value={form.cgpa} onChange={(e) => set("cgpa", Number(e.target.value))} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Skills</label>
                  <input className="input" value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="e.g. Python, SQL, React" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Resume Summary</label>
                  <textarea className="input" rows={3} value={form.resumeSummary} onChange={(e) => set("resumeSummary", e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Company Name</label>
                  <input className="input" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} required />
                </div>
                <div>
                  <label className="label">Industry</label>
                  <input className="input" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
                </div>
                <div>
                  <label className="label">Website</label>
                  <input className="input" value={form.website} onChange={(e) => set("website", e.target.value)} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
