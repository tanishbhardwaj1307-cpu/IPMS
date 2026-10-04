import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Login failed");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Login succeeded, but the session could not be established.");
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("auth_user_id", user.id).maybeSingle();
    if (profile?.role) navigate(`/${profile.role}/dashboard`);
  }



  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">IP</div>
          <span className="text-xl font-bold text-slate-800">IPMS</span>
        </Link>
        <div className="card p-8">
          <h1 className="mb-1 text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="mb-6 text-sm text-slate-500">Sign in to your account to continue.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
            Demo account emails are documented in the README. Passwords are chosen during the secure Auth bootstrap and are never embedded in the client.
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
